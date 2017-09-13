#include "pxt.h"
extern "C" {
#include <nrf_soc.h>
#include <nacl/armnacl.h>
#include <machine/endian.h>
}

// 0xCE + [4 byte id] + [0xD9|0xDA] + [1|2 byte length] + [64 byte signature] + [message]
#define PACKET_HEADER_SIZE (1 + 4 + 3)
#define SIGNATURE_SIZE crypto_sign_BYTES
#define MAX_MESSAGE_SIZE (512 - SIGNATURE_SIZE - 8)

namespace ubirch {
    // inherently unsafe
    static unsigned char signingKey[crypto_sign_SECRETKEYBYTES];

    // convert an ascii hex digit to a number
    inline int hexdigit(char d) {
        return (d & 0x1f) + ((d >> 6) * 0x19) - 0x10;
    }

    //%
    bool setInternalSignKey(StringData *encodedKey) {
        if(encodedKey->len != crypto_sign_SECRETKEYBYTES*2) return false;
        for(int i = 0; i < crypto_sign_SECRETKEYBYTES; i++) {
            signingKey[i] = (hexdigit(encodedKey->data[i*2]) << 4) | hexdigit(encodedKey->data[i*2+1]);
        }
        return true;
    }

    //%
    StringData *createSignPacket(StringData *message) {
        const unsigned int signedMessageLength = crypto_sign_BYTES + message->len;
        const unsigned int packetSize = PACKET_HEADER_SIZE + signedMessageLength;

        // allocate the string data buffer (has a max overhead of 2 byte due to msgpack encoding and terminating \0)
        auto packet = (StringData *) malloc(4 + packetSize + 1);
        // initialize the packet
        packet->init();
        packet->len = (uint16_t) packetSize;

        // position in the msgpack data structure
        uint16_t index = 0;

        // write the device id
        packet->data[index++] = (uint8_t) 0xce;
        // we need to store the device id big endian
        uint32_t _deviceId = __builtin_bswap32(microbit_serial_number());
        memcpy(packet->data + index, (uint8_t *) &_deviceId, 4);
        index += 4;

        // write message and handle different length
        if (signedMessageLength < 256) {
            // long messages have only two byte headers
            packet->data[index++] = (uint8_t) 0xd9;
            packet->data[index++] = (uint8_t) signedMessageLength;
        } else if (signedMessageLength < MAX_MESSAGE_SIZE) {
            // long messages have tree byte headers
            packet->data[index++] = (uint8_t) 0xda;
            uint16_t _signedMessageLength = __builtin_bswap16((uint16_t) signedMessageLength);
            memcpy(packet->data + index, &_signedMessageLength, 2);
            index += 2;
        } else {
            // we have a size limitation
#ifndef NDEBUG
            printf("encoding failed: message too long: %d > %d (max)\r\n", signedMessageLength, MAX_MESSAGE_SIZE);
#endif
            delete packet;
            return ManagedString().leakData();
        }

        // do the actual signature generation and add it to the packet
        crypto_uint16 smlen;
        if (crypto_sign((unsigned char *) (packet->data + index), &smlen, (const unsigned char *) message->data,
                         (crypto_uint16) (message->len), signingKey)) {
#ifndef NDEBUG
            printf("signing failed\r\n");
#endif
            delete packet;
            return ManagedString().leakData();
        }

        // set the correct length
        packet->len = index + smlen;

        return packet;
    }

    //%
    StringData *encrypt(StringData *cleartext) {
        if(!uBit.ble) return ManagedString().leakData();

        nrf_ecb_hal_data_t ecb_hal_data = {};
        memset(&ecb_hal_data, 0, sizeof(ecb_hal_data));
        memcpy(ecb_hal_data.key, (const uint8_t *) &NRF_FICR->DEVICEID, 8);
        memcpy(ecb_hal_data.key + 8, (const uint8_t *) &NRF_FICR->DEVICEID, 8);

        StringData *buffer;
        buffer = (StringData *) malloc(4 + (cleartext->len / 16 + 1) * 16 + 1);
        buffer->len = 0;
        buffer->init();

        for (unsigned int i = 0; i < cleartext->len; i += 16) {
            memset(ecb_hal_data.cleartext, 0, 16);
            memset(ecb_hal_data.ciphertext, 0, 16);

            strncpy((char *) ecb_hal_data.cleartext, cleartext->data + i, 16);
            if (sd_ecb_block_encrypt(&ecb_hal_data) != NRF_SUCCESS) {
                buffer->decr();
                return ManagedString().leakData();
            } else {
                memcpy(&buffer->data[i], ecb_hal_data.ciphertext, 16);
                buffer->len = buffer->len + 16;
            }
        }

        return buffer;
    }
}
