# ubirch NB-IoT message module

This is a package for sending signed data messages to the [ubirch](http://ubirch.com) backend.
It can be used by the [PXT Calliope mini editor](https://pxt.calliope.cc/). Should also work
with PXT for Micro:bit.

## Testing

- Modify `tests.ts` to send packages to your own server.
- Execute a little server: `nc -vv -ul -p 9090` (Linux, also echos the messages) 
- Compile the test `pxt test` and copy `built/binary.hex` to the Calliope mini.

On the USB console window you will see this:

```
TEST START
!!!!  PACKET & SIGNATURE TEST
ID BC9AB239
TEST: create unsigned packet: OK
TEST: set sign key: OK
TEST: create signed packet: OK
!!!!  NETWORK TEST
TEST: sending hello world: OK
TEST: sending number (temp): OK
TEST: sending number (light): OK
TEST: sending string: OK
TEST FINISHED OK

``` 

> It will take some time to send the messages, as the the nRF51 not the fastest chip for
> the Ed25519 signature generation.

## Example

### Blocks
![Example Code](example.png)

### Javascript

```typescript
input.onButtonPressed(Button.A, () => {
    bc95.send(
        ubirch.createNumberMessage(
            "temperature",
            input.temperature()
        )
    )
    if (!(bc95.sendOk())) {
        basic.showIcon(IconNames.Sad)
    }
})
input.onButtonPressed(Button.B, () => {
    bc95.send(
        ubirch.createStringMessage(
            "info",
            control.deviceName()
        )
    )
    if (!(bc95.sendOk())) {
        basic.showIcon(IconNames.Sad)
    }
})
ubirch.setSignKey("3bc4b2499d97501aba63b0f6308f8d913bcbdceda853269d6875a06a6432fac77b60882bee2e3f017907ce84e5e1c87f705760fac5877fe0de7c5806c4691f2f")
modem.enableDebug(true)
bc95.init(
    SerialPin.C17,
    SerialPin.C16,
    BaudRate.BaudRate9600
)
bc95.attach(
    6
)
bc95.setServer("46.23.86.61", 9090)
```

## Meta

- PXT/calliope
- PXT/microbit

Depends on [pxt-calliope-bc95](https://github.com/calliope-mini/pxt-calliope-bc95).

Author: Matthias L. Jugel ([@thinkberg](https://twitter.com/thinkberg))

## License

MIT