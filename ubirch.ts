/**
 * ubirch messaging functions.
 */


    //% weight=2 color=#117447 icon="\u1f50f" block="ubirch"
//% parts="ubirch"
namespace ubirch {
    /**
     * Send a number to the backend server. Encodes key/value as a json message.
     */
    //% weight=70
    //% blockId=ubirch_sendNumber block="send number message|key %key|value %n"
    //% blockExternalInputs=1
    //% parts="ubirch"
    export function sendNumber(key: string, value: number): void {
        send("{\"" + key + "\":" + value + "}");
    }

    /**
     * Send a string to the backend server. Encodes key/value as a json message.
     */
    //% weight=70
    //% blockId=ubirch_sendString block="send string message|key %key|value %n"
    //% blockExternalInputs=1
    //% parts="ubirch"
    export function sendString(key: string, value: string): void {
        send("{\"" + key + "\":\"" + value + "\"}");
    }

    /**
     * Send the actual message, signed and encoded. Data is encoded in message pack format:
     * INT[DeviceId]BYTES[Signature+Message]. The maximum message size is 440 bytes.
     * @param message the message to send
     */
    //% weight=60
    //% blockId=ubirch_send block="send raw message|message %message"
    //% blockExternalInputs=1
    //% advanced=true
    //% parts="ubirch"
    export function send(message: string): void {
        let packet = createSignPacket(message);
        if (packet.length > 0) {
            // send UDP packet
            bc95.send(packet);
        }
    }

    /**
     * Set secret key to sign messages as a hex encoded string.
     * @param signKey the key used for signing
     */
    //% blockId=ubirch_setSignkey block="set sign key %signKey"
    //% parts="ubirch"
    export function setSignKey(signKey: string) {
        if(!setInternalSignKey(signKey)) basic.showString("WRONG KEY SIZE");
    }

    //% shim=ubirch::setInternalSignKey
    export function setInternalSignKey(encoded: string): boolean {
        return;
    }

    /**
     * Show Calliope device id and the secret for communication.
     */
    //% blockId=ubirch_showdeviceinfo block="show device Info|on display %onDisplay"
    //% parts="ubirch"
    //% advanced=true
    export function showDeviceInfo(onDisplay: boolean = true): void {
        let deviceId = stringToHex(numberToString(control.deviceSerialNumber()));
        modem.log("ID", deviceId);
        if (onDisplay) basic.showString("id:" + deviceId, 250);
    }

    // helper function to convert a string into a hex representation usable by the module
    export function stringToHex(s: string): string {
        const l = "0123456789ABCDEF";
        let r = "";
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            r = r + l.substr((c >> 4), 1) + l.substr((c & 0x0f), 1);
        }
        return r;
    }

    // converts a number into a binary string representation
    function numberToString(n: number): string {
        return String.fromCharCode((n >> 24) & 0xff) +
            String.fromCharCode((n >> 16) & 0xff) +
            String.fromCharCode((n >> 8) & 0xff) +
            String.fromCharCode(n & 0xff);
    }

    //% shim=ubirch::createSignPacket
    export function createSignPacket(message: string): string {
        return message;
    }
}