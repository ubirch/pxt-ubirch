/**
 * ubirch messaging functions.
 */


//% weight=2 color=#71c05c icon="\uf023" block="ubirch"
//% parts="ubirch"
namespace ubirch {
    /**
     * Create a number message as a signed packet to send to the server. Encodes key/value as a json message.
     * @param key the name of the data
     * @param value the actual value to send
     */
    //% weight=70
    //% blockId=ubirch_createNumberMessage block="number key %key|value %n"
    //% blockExternalInputs=1
    //% parts="ubirch"
    export function createNumberMessage(key: string, value: number): string {
        return signPacket("{\"" + key + "\":" + value + "}");
    }

    /**
     * Send a string to the backend server. Encodes key/value as a json message.
     * @param key the name of the data
     * @param value the actual value to send
     */
    //% weight=70
    //% blockId=ubirch_createStringMessage block="string key %key|value %n"
    //% blockExternalInputs=1
    //% parts="ubirch"
    export function createStringMessage(key: string, value: string): string {
        return signPacket("{\"" + key + "\":\"" + value + "\"}");
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
        return encoded.length == 128;
    }

    /**
     * Show Calliope mini device id. It is used when encoding messages to identify
     * the device.
     */
    //% blockId=ubirch_showdeviceinfo block="show device Info|on display %onDisplay"
    //% parts="ubirch"
    export function showDeviceInfo(onDisplay: boolean = true): void {
        let deviceId = stringToHex(numberToString(control.deviceSerialNumber()));
        if (onDisplay) basic.showString("id:" + deviceId, 250);
    }

    /**
     * Helper function to convert a string into a hex representation.
     */
    //% blockId=ubirch_stringToHex block="to hex %s"
    //% parts="ubirch"
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

    //% shim=ubirch::signPacket
    export function signPacket(message: string): string {
        return message;
    }
}