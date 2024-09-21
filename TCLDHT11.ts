
/**
* Use this file to define custom functions and blocks.
* Read more at https://makecode.microbit.org/blocks/custom
*/

enum MyEnum {
    //% block="one"
    One,
    //% block="two"
    Two
}

/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon=""
namespace custom {
    /**
     * TODO: describe your function here
     * @param n describe parameter here, eg: 5
     * @param s describe parameter here, eg: "Hello"
     * @param e describe parameter here
     */
    //% block
    export function foo(n: number, s: string, e: MyEnum): void {
        // Add code here
    }

    /**
     * TODO: describe your function here
     * @param value describe value here, eg: 5
     */
    //% block
    export function fib(value: number): number {
        return value <= 1 ? value : fib(value -1) + fib(value - 2);
    }
}

let dht11Humidity = 0
let dht11Temperature = 0

/**
 * get dht11 temperature and humidity Value
 * @param dht11pin describe parameter here, eg: DigitalPin.P15
 */
//% advanced=true
//% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
export function dht11value(dht11type: DHT11Type, dht11pin: DigitalPin): 
number {
    const DHT11_TIMEOUT = 100
    const buffer = pins.createBuffer(40)
    const data = [0, 0, 0, 0, 0]
    let startTime = control.micros()

    if (control.hardwareVersion().slice(0, 1) !== '1') { // V2
        // TODO: V2 bug
        pins.digitalReadPin(DigitalPin.P0);
        pins.digitalReadPin(DigitalPin.P1);
        pins.digitalReadPin(DigitalPin.P2);
        pins.digitalReadPin(DigitalPin.P3);
        pins.digitalReadPin(DigitalPin.P4);
        pins.digitalReadPin(DigitalPin.P10);

        // 1.start signal
        pins.digitalWritePin(dht11pin, 0)
        basic.pause(18)

        // 2.pull up and wait 40us
        pins.setPull(dht11pin, PinPullMode.PullUp)
        pins.digitalReadPin(dht11pin)
        control.waitMicros(40)

        // 3.read data
        startTime = control.micros()
        while (pins.digitalReadPin(dht11pin) === 0) {
            if (control.micros() - startTime > DHT11_TIMEOUT) break
        }
        startTime = control.micros()
        while (pins.digitalReadPin(dht11pin) === 1) {
            if (control.micros() - startTime > DHT11_TIMEOUT) break
        }

        for (let dataBits = 0; dataBits < 40; dataBits++) {
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 1) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 0) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }
            control.waitMicros(28)
            if (pins.digitalReadPin(dht11pin) === 1) {
                buffer[dataBits] = 1
            }
        }
    } else { // V1
        // 1.start signal
        pins.digitalWritePin(dht11pin, 0)
        basic.pause(18)

        // 2.pull up and wait 40us
        pins.setPull(dht11pin, PinPullMode.PullUp)
        pins.digitalReadPin(dht11pin)
        control.waitMicros(40)

        // 3.read data
        if (pins.digitalReadPin(dht11pin) === 0) {
            while (pins.digitalReadPin(dht11pin) === 0);
            while (pins.digitalReadPin(dht11pin) === 1);

            for (let dataBits = 0; dataBits < 40; dataBits++) {
                while (pins.digitalReadPin(dht11pin) === 1);
                while (pins.digitalReadPin(dht11pin) === 0);
                control.waitMicros(28)
                if (pins.digitalReadPin(dht11pin) === 1) {
                    buffer[dataBits] = 1
                }
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
            if (buffer[8 * i + j] === 1) {
                data[i] += 2 ** (7 - j)
            }
        }
    }

    if (((data[0] + data[1] + data[2] + data[3]) & 0xff) === data[4]) {
        dht11Humidity = data[0] + data[1] * 0.1
        dht11Temperature = data[2] + data[3] * 0.1
    }

    switch (dht11type) {
        case DHT11Type.DHT11_temperature_C:
            return dht11Temperature
        case DHT11Type.DHT11_temperature_F:
            return (dht11Temperature * 1.8) + 32
        case DHT11Type.DHT11_humidity:
            return dht11Humidity
    }
}
