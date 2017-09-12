// this test runs on the device, connect and it will send the output on serial
// after everything is done
// run pxt test & copy build/binary.hex to MINI drive
namespace test_ubirch {
    let SERVER = "46.23.86.61";
    let PORT = 9090;

    // loop until button A is kept pressed
    const LOOP = false;
    // log AT commands to USB console
    const DEBUG_AT = false;

    //% shim=pxtrt::panic
    function panic(code2: number): void {
    }

    function assert(msg: string, cond: boolean) {
        if (!cond) {
            modem.log("ASSERT:", msg + " failed");
            panic(45);
        } else {
            modem.log("TEST:", msg + ": OK");
        }
    }

    const SECRET = "3bc4b2499d97501aba63b0f6308f8d913bcbdceda853269d6875a06a6432fac77b60882bee2e3f017907ce84e5e1c87f705760fac5877fe0de7c5806c4691f2f";
    const PACKET = "CEBC9AB239D94BCCA154EAA8FA9D000B217153F526E7A319865F05554BBC62B5FD211143F8177D33E6A56DB5EEEB6BF3CE79C9082041BF1B699ED34C39ECD4ED9214308354000B48454C4C4F20574F524C44";

    console.log("TEST START");

    modem.log("!!!! ", "PACKET & SIGNATURE TEST");

    ubirch.showDeviceInfo(false);
    // set the secret signing key
    let signKeyOk = ubirch.setInternalSignKey(SECRET);
    assert("set sign key", signKeyOk);
    let packet = ubirch.createSignPacket("HELLO WORLD");
    assert("create signed packet", ubirch.stringToHex(packet) == PACKET);

    modem.log("!!!! ", "NETWORK TEST");

    // test modem functionality
    modem.enableDebug(DEBUG_AT);

    // initialize module
    bc95.init(SerialPin.C17, SerialPin.C16, BaudRate.BaudRate9600);

    // attach to the network
    bc95.attach(6);
    bc95.setServer(SERVER, PORT);

    ubirch.send("HELLO WORLD!");
    assert("sending hello world", bc95.sendOk());

    // loop to send some values every 10 minutes
    do {
        ubirch.sendNumber("temp", input.temperature());
        assert("sending number (temp)", bc95.sendOk());
        ubirch.sendNumber("light", input.lightLevel());
        assert("sending number (light)", bc95.sendOk());
        ubirch.sendString("test", "value " + input.temperature());
        assert("sending string", bc95.sendOk());
        for (let i = 0; LOOP && !input.buttonIsPressed(Button.A) && i < 600; i++) {
            basic.pause(1000);
        }
    } while (LOOP && !input.buttonIsPressed(Button.A));

    serial.resetSerial();
    console.log("TEST FINISHED OK");
    basic.pause(1000);
}