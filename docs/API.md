## Modules

<dl>
<dt><a href="#module_Functions">Functions</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#automode">automode</a></dt>
<dd><p>Object for controlling automode timers and timeouts.
<a href="https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/module-Functions-Automode.html">https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/module-Functions-Automode.html</a></p>
</dd>
</dl>

<a name="module_Functions"></a>

## Functions

* [Functions](#module_Functions)
    * _static_
        * [.RealTimeData()](#module_Functions.RealTimeData)
        * [.manualDisplay()](#module_Functions.manualDisplay)
        * [.manualInputSync()](#module_Functions.manualInputSync)
        * [.automaticDisplay()](#module_Functions.automaticDisplay)
        * [.submittedAutoPressure()](#module_Functions.submittedAutoPressure)
        * [.autoInputSync()](#module_Functions.autoInputSync)
    * _inner_
        * [~Automode](#module_Functions..Automode)
            * [new Automode()](#new_module_Functions..Automode_new)
            * [.setTimeout()](#module_Functions..Automode+setTimeout)
            * [.setInterval(wantedPressure)](#module_Functions..Automode+setInterval)

<a name="module_Functions.RealTimeData"></a>

### Functions.RealTimeData()
Function sets interval to poll current pressure and fan speed of the embedded device.Changes #pressure_div and #speed_div elements to current pressure and speed.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions.manualDisplay"></a>

### Functions.manualDisplay()
Function turns manual mode HTML -elements visible and automatic mode elements hidden.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions.manualInputSync"></a>

### Functions.manualInputSync()
Function synchronizes manual mode's input values. When slider input is moved, number input is changed tosame value and vice versa.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions.automaticDisplay"></a>

### Functions.automaticDisplay()
Turns automatic mode elements visible.Function is activated when switch is pressed.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions.submittedAutoPressure"></a>

### Functions.submittedAutoPressure()
Sets timers on using automode -objectFunction is activated when "submit" -button is pressed.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions.autoInputSync"></a>

### Functions.autoInputSync()
Function synchronizes automatic mode's input values. When slider input is moved, number input is changed tosame value and vice versa.

**Kind**: static method of [<code>Functions</code>](#module_Functions)  
<a name="module_Functions..Automode"></a>

### Functions~Automode
**Kind**: inner class of [<code>Functions</code>](#module_Functions)  

* [~Automode](#module_Functions..Automode)
    * [new Automode()](#new_module_Functions..Automode_new)
    * [.setTimeout()](#module_Functions..Automode+setTimeout)
    * [.setInterval(wantedPressure)](#module_Functions..Automode+setInterval)

<a name="new_module_Functions..Automode_new"></a>

#### new Automode()
Controls the timers and timeouts for the automatic mode. If pressure is not settled to wanted pressurewithin 10 seconds, creates an "alert"-popup for user.

<a name="module_Functions..Automode+setTimeout"></a>

#### automode.setTimeout()
Function sets timeout. If timeout not cleared in reasonable time, alert pops up.

**Kind**: instance method of [<code>Automode</code>](#module_Functions..Automode)  
<a name="module_Functions..Automode+setInterval"></a>

#### automode.setInterval(wantedPressure)
Function sends wanted pressure value to server. Function also starts an interval to poll current pressure. If current pressure settles to wanted pressure, clears timeout and interval.

**Kind**: instance method of [<code>Automode</code>](#module_Functions..Automode)  

| Param | Type | Description |
| --- | --- | --- |
| wantedPressure | <code>integer</code> | pressure value what user set on automatic mode. |

<a name="automode"></a>

## automode
Object for controlling automode timers and timeouts.[https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/module-Functions-Automode.html](https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/module-Functions-Automode.html)

**Kind**: global constant  
