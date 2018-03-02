// this test runs on the device, connect and it will send the output on serial
// after everything is done
// run pxt test & copy build/binary.hex to MINI drive
namespace test_ubirch {
    //% shim=pxtrt::panic
    function panic(code2: number): void {
    }

    function assert(msg: string, cond: boolean) {
        if (!cond) {
            console.log("ASSERT:" + msg + " failed");
            panic(45);
        } else {
            console.log("TEST:" + msg + ": OK");
        }
    }

    // converts a number into a readable hex-string representation
    export function numberToHex(n: number): string {
        return ubirch.stringToHex(numberToString(n));
    }

    // converts a number into a binary string representation
    export function numberToString(n: number): string {
        return String.fromCharCode((n >> 24) & 0xff) +
            String.fromCharCode((n >> 16) & 0xff) +
            String.fromCharCode((n >> 8) & 0xff) +
            String.fromCharCode(n & 0xff);
    }

    let SERIAL = numberToHex(control.deviceSerialNumber());
    let SECRET = "3bc4b2499d97501aba63b0f6308f8d913bcbdceda853269d6875a06a6432fac77b60882bee2e3f017907ce84e5e1c87f705760fac5877fe0de7c5806c4691f2f";
    let SIGNED = "01CE"+SERIAL+"D94BCCA154EAA8FA9D000B217153F526E7A319865F05554BBC62B5FD211143F8177D33E6A56DB5EEEB6BF3CE79C9082041BF1B699ED34C39ECD4ED9214308354000B48454C4C4F20574F524C44";
    let UNSIGN = "00CE"+SERIAL+"D90B48454C4C4F20574F524C44";

    console.log("TEST START");

    console.log("PACKET & SIGNATURE TEST");

    ubirch.showDeviceInfo(false);
    // test unsigned
    let packet = ubirch.signPacket("HELLO WORLD");
    console.log(ubirch.stringToHex(packet));
    assert("create unsigned packet", ubirch.stringToHex(packet) == UNSIGN);

    // set the secret signing key
    let signKeyOk = ubirch.setInternalSignKey(SECRET);
    assert("set sign key", signKeyOk);
    packet = ubirch.signPacket("HELLO WORLD");
    console.log(ubirch.stringToHex(packet));
    assert("create signed packet", ubirch.stringToHex(packet) == SIGNED);

    console.log(ubirch.stringToHex(ubirch.createNumberMessage("temp", input.temperature())));
}