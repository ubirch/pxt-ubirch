# Script to test the message pack messages
# Unpacks the message pack data and decrypts it if a secret is given
#
# @author Matthias L. Jugel

import ed25519
from Crypto.Cipher import AES
import msgpack
import sys

# provide the message as the first argument and the pubkey as second
message = "cebc9ab239d94cdd9efa8f9c50c7bf4b40eec73df931562cc3eaccb06f8c5c9f5d3a383c62a7be0a13e836a3c0700ed93697e9c3add62d34289c3bf7cddb43730efbc26f78ad0048454c4c4f20574f524c442180"
pubkey = "7b60882bee2e3f017907ce84e5e1c87f705760fac5877fe0de7c5806c4691f2f"

if len(sys.argv) > 1:
    message = sys.argv[1]

# if necessary provide key as second argument
secret = None
if len(sys.argv) > 2:
    pubkey = sys.argv[2]

if pubkey is not None:
    data = message.decode("hex")
    # unpack first element (ignore rest, which is padding)
    unpacker = msgpack.Unpacker()
    unpacker.feed(data)
    print "DEVICE   : "+hex(unpacker.next())
    signed = unpacker.next()
    signature = signed[0:64]
    print "SIGNATURE: "+ "".join(format(ord(x), '02x') for x in signature)
    signedMessage = signed[64:]
    print "MESSAGE  : "+str(signedMessage)
    # decode the public key
    vk = ed25519.VerifyingKey(pubkey, encoding="hex")
    try:
        vk.verify(signature, signedMessage, encoding=None)
        print "VERIFIED"
    except ed25519.BadSignatureError:
        print "VERIFICATION FAILED"
else:
    data = message.decode("hex")
    # unpack first element (ignore rest, which is padding)
    unpacker = msgpack.Unpacker()
    unpacker.feed(data)
    print "KEY : "+str(unpacker.next())
    print "DATA: "+unpacker.next()
