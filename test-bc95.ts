let SERVER = "46.23.86.61";
let PORT = 9090;

// loop until button A is kept pressed
const LOOP = false;
// log AT commands to USB console
const DEBUG_AT = false;

modem.log("!!!! ", "NETWORK TEST");

// test modem functionality
modem.enableDebug(DEBUG_AT);

// initialize module
bc95.init(SerialPin.C17, SerialPin.C16, BaudRate.BaudRate9600);

// attach to the network
bc95.attach(6);
bc95.setServer(SERVER, PORT);

bc95.send(ubirch.signPacket("HELLO WORLD!"));
assert("sending hello world", bc95.sendOk());

// loop to send some values every 10 minutes
do {
    bc95.send(ubirch.createNumberMessage("temp", input.temperature()));
    assert("sending number (temp)", bc95.sendOk());
    bc95.send(ubirch.createNumberMessage("light", input.lightLevel()));
    assert("sending number (light)", bc95.sendOk());
    bc95.send(ubirch.createStringMessage("test", "value " + input.temperature()));
    assert("sending string", bc95.sendOk());
    for (let i = 0; LOOP && !input.buttonIsPressed(Button.A) && i < 600; i++) {
        basic.pause(1000);
    }
} while (LOOP && !input.buttonIsPressed(Button.A));

serial.resetSerial();
console.log("TEST FINISHED OK");
basic.pause(1000);