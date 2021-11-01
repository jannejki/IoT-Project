'use strict';

/**
 * Object for controlling automode timers and timeouts.
 * {@link https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/module-Functions-Automode.html}
 */
const automode = new Automode();

/**
 * When whole page is refreshed, checks what mode is on and sets corresponding
 * mode elements visible.
 */
window.onload = function () {
    var mode = document.getElementById("mode").value;
    if (mode == 1) {
        document.getElementById("flexSwitchCheckDefault").checked = true;
        manualDisplay();
        manualInputSync();
        RealTimeData();
    } else if (mode == 0) {
        document.getElementById("flexSwitchCheckDefault").checked = false;
        automaticDisplay();
        autoInputSync();
    }
}

var box = document.getElementById("flexSwitchCheckDefault");

/**
 * Function checks if switch is checked. If checked, hides automatic mode elements and
 * sets manual mode elements visible. Uses RealTimeData() function to start polling
 * real time pressure and fan speed.
 * if switch not checked, sets automatic mode elements visible and hides manual mode elements.
 */
box.onchange = function () {
    if (document.getElementById("flexSwitchCheckDefault").checked) {
        document.querySelectorAll("[id='mode']")[0].value = document.querySelectorAll("[id='mode']")[1].value = 1;
        document.getElementById("automatic_pressure_div").style.display = "none";
        manualDisplay();
        manualInputSync();
        RealTimeData();
    } else {
        document.getElementById("nav-bar").className = "navbar bg-danger p-3 mb-4";
        document.getElementById("mode_name").innerHTML = "Automatic mode";
        document.getElementById("input_speed_div").style.display = "none";
        document.getElementById("mode").value = 0;
        automaticDisplay();
        autoInputSync();
    }
};


//--------------------------------------------------------------------//
//--------------------------FUNCTIONS---------------------------------//
/**
 * @module Functions
 */

/**
 * Function sets interval to poll current pressure and fan speed of the embedded device.
 * Changes #pressure_div and #speed_div elements to current pressure and speed.
 * @memberOf module:Functions
 */
function RealTimeData() {
    setInterval(() => {
        fetch('/pressureLvl')
            .then(response => {
                return response.text();
            })
            .then(data => {
                var pressure = JSON.parse(data).pressure;
                var speed = JSON.parse(data).speed;
                document.getElementById("pressure_div").innerHTML = "Current pressure: " + pressure + "Pa";
                document.getElementById("speed_div").innerHTML = "Current speed: " + speed + "%";
            })
    }, 2000);
};

/**
 * Function turns manual mode HTML -elements visible and automatic mode elements hidden.
 *  @memberOf module:Functions
 */
function manualDisplay() {
    document.getElementById("nav-bar").className = "navbar bg-info  p-3 mb-4";
    document.getElementById("mode_name").innerHTML = "Manual mode";
    document.getElementById("input_speed_div").style.display = "block";
    document.getElementById("automatic_pressure_div").style.display = "none";
};

/**
 * Function synchronizes manual mode's input values. When slider input is moved, number input is changed to
 * same value and vice versa.
 *  @memberOf module:Functions
 */
function manualInputSync() {
    let speedInput = document.getElementById("speed_value");
    let sliderInput = document.getElementById("formControlRangeSpeed");
    speedInput.addEventListener("input", () => {
        sliderInput.value = speedInput.value;
    })

    sliderInput.oninput = function () {
        speedInput.value = this.value;
    }
}

/**
 * Turns automatic mode elements visible.
 * Function is activated when switch is pressed.
 *  @memberOf module:Functions
 */
function automaticDisplay() {
    document.getElementById("mode_name").innerHTML = "Automatic mode";
    document.getElementById("automatic_pressure_div").style.display = "block";
}

/**
 * Sets timers on using automode -object
 * Function is activated when "submit" -button is pressed.
 * @memberOf module:Functions
 */
function submittedAutoPressure() {
    automode.setInterval(document.getElementById("wantedPressure").value);
    automode.setTimeout();
}

/**
 * Function synchronizes automatic mode's input values. When slider input is moved, number input is changed to
 * same value and vice versa.
 *  @memberOf module:Functions
 */
function autoInputSync() {
    let numberInput = document.getElementById("wantedPressure");
    let sliderInput = document.getElementById("formControlRange");
    document.getElementById("submitAuto").addEventListener("click", submittedAutoPressure);
    numberInput.addEventListener("input", () => {
        sliderInput.value = numberInput.value;
    })

    sliderInput.oninput = function () {
        numberInput.value = this.value;
    }
}


//--------------------------------------------------------------------//
//---------------------------CLASSES----------------------------------//
/**
 * Controls the timers and timeouts for the automatic mode. If pressure is not settled to wanted pressure
 * within 10 seconds, creates an "alert"-popup for user.
 * @constructor Automode
 */
function Automode() {
    let timeout;
    let interval;

    /**
     * Function sets timeout. If timeout not cleared in reasonable time, alert pops up.
     */
    this.setTimeout = function () {
        timeout = setTimeout(function () {
            alert("Couldn't settle the pressure in reasonable time!");
        }, 100000);
    };

    /**
     *  Function sends wanted pressure value to server. Function also starts an interval to poll current pressure.
     *  If current pressure settles to wanted pressure, clears timeout and interval.
     * @param wantedPressure {integer} pressure value what user set on automatic mode.
     */
    this.setInterval = function (wantedPressure) {
        clearTimeout(timeout);
        clearInterval(interval);
        interval = setInterval(() => {
            fetch('/pressureLvl')
                .then(response => {
                    return response.text();
                })
                .then(data => {
                    let pressure = JSON.parse(data).pressure;
                    if (pressure == wantedPressure) {
                        alert("pressure settled!");
                        clearTimeout(timeout);
                        clearInterval(interval);
                    }
                })
        }, 2000);
    };
}