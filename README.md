## README

This is a project for the *Internet of Things TX00CI63-3006* -course in Metropolia. Aim for this project was to create a web interface for displaying information from and issuing commands to the ABB ventilation controller, which was a project for *Embedded Systems Programming TX00CI61-3010*. 

Group members who participated in this project:
- Janne Kinnunen
- Chloe Maillot
- Madeline Michalet

You can find the JSdoc documentation for [server.js file here](https://users.metropolia.fi/~jannejki/IoT%20project%20server.js%20JSdoc/) and for the [client.js file here.](https://users.metropolia.fi/~jannejki/IoT%20project%20client.js%20JSdoc/index.html)


# **User Manual**
-------------------------------

### connecting to the web application

You can acess the web application via http://localhost:3000. If you have an account, you will have to authenticate to access this web application.

<img src="https://user-images.githubusercontent.com/61495584/139654035-7ff701c7-fe31-487a-b0a6-aef4f6496449.png" alt="drawing" width="50%"/>

If you try to access the web application without authenticate, an error message will appear.
You can log in by clicking on the link.

<img src="https://user-images.githubusercontent.com/61495584/139654098-38179a97-1c91-49d0-9ef7-6da6aa7a8af5.png" alt="drawing" width="50%"/>

If you tapped the wrong login or password, an error message will tell you but you will be able
to try log in again by clicking on the link.

<img src="https://user-images.githubusercontent.com/61495584/139654138-4dcde78a-1a2e-4ec8-867a-7f872361905f.png" alt="drawing" width="50%"/>

When you finally got to log in, the web application will open, and you will be able to control
the ABB ventilation controller simulator and get information about it.
Whenever you want to log out from the web application, you will just have to click on Log Out
at the bottom of the page.

<img src="https://user-images.githubusercontent.com/61495584/139654210-4a26f49f-ec1e-4c8e-8689-9b30005b122e.png" alt="drawing" width="50%"/>

A message will tell you that you got successfully disconnected and also allow you to log
again by clicking on the link

<img src="https://user-images.githubusercontent.com/61495584/139654268-66caa8ab-1f84-4bfa-a7f3-506b4dd06897.png" alt="drawing" width="50%"/>
    
    
    
## **How to use the web application?**
-----------------------------------------------------------------------------------------------------------------
### Automatic mode 

<img src="https://user-images.githubusercontent.com/61495584/139654375-dbfc32f0-168f-47a5-8509-d3724ffe4d1d.png" alt="drawing" width="50%"/>

The automatic mode is the default mode, and the web application interface is red for this
mode. If it is not the case, you can go to the automatic mode by clicking on the switch at the
right-top corner of the page.

<img src="https://user-images.githubusercontent.com/61495584/139654413-de46aea3-839e-4a6a-8b5d-232d44a584f8.png" alt="drawing" width="50%"/>

In the automatic mode, you can set the pressure that you want from 0 to 120 Pa. Depending
on the pressure that you choose, the fan speed will change automatically.

<img src="https://user-images.githubusercontent.com/61495584/139654486-f6643c3a-d958-4724-90c3-2ffd6174709c.png" alt="drawing" width="50%"/>

After some time, if the pressure couldn’t been set you will get a pop-up to warn you about it.

<img src="https://user-images.githubusercontent.com/61495584/139654768-acc342f9-f5d5-418a-8915-1f02998ee645.png" alt="drawing" width="50%"/>

Otherwise, the higher the chosen pressure is the higher the speed of the fan will be.


### Manual mode

<img src="https://user-images.githubusercontent.com/61495584/139654822-9b1d83f4-ffb0-410c-82a6-6d70902bea90.png" alt="drawing" width="50%"/>

The manual mode got a blue interface in the web application. You can choose to go to the
manual mode by clicking on the switch at the right-hand corner of the page.

<img src="https://user-images.githubusercontent.com/61495584/139654875-09d8b1c0-a645-43d8-9f31-1eb7abc5e190.png" alt="drawing" width="50%"/>

In the manual mode you can set the ventilation fan speed but choosing the percentage that
you want. When submitting the chosen value, you will get the current speed percentage but
also the current pressure of the ABB ventilation controller simulator.

<img src="https://user-images.githubusercontent.com/61495584/139654968-449b2dfe-5e76-4478-8c7c-0c1250014e86.png" alt="drawing" width="50%"/>

### Data logs

In both modes, you can print a graph showing the evolution of the speed and pressure from
the ABB ventilation controller simulator.

<img src="https://user-images.githubusercontent.com/61495584/139655049-fda5e899-c386-48ae-84e1-2cd94b0617e2.png" alt="drawing" width="50%"/>

For that, you will have to choose the period on which you want to see the graphical data.

<img src="https://user-images.githubusercontent.com/61495584/139655164-8ea8bc6b-839b-47a0-a60d-4c07d70e9eb1.png" alt="drawing" width="50%"/>

By clicking on the button See, you will then see the graphical data on the period chosen

<img src="https://user-images.githubusercontent.com/61495584/139655273-cac840dd-a1aa-4551-9e2e-8d54965e58ff.png" alt="drawing" width="50%"/>

### Connections logs

In the home page, to **which you can go back to by clicking on ABB Ventilation
Controller**, you can ask to see the logs of the users’ connections.
For that, you will have to click on *User logs* at the bottom of the home page.

<img src="https://user-images.githubusercontent.com/61495584/139654210-4a26f49f-ec1e-4c8e-8689-9b30005b122e.png" alt="drawing" width="50%"/>

After clicking the button, you will go to this page:

<img src="https://user-images.githubusercontent.com/61495584/139655590-9fcf5356-5653-4919-9d06-21416aa6e648.png" alt="drawing" width="50%"/>

From there, you can choose for which user you want to see the connections logs.

<img src="https://user-images.githubusercontent.com/61495584/139655677-36f9c2f8-8670-4b25-9162-4d98d5930c7d.png" alt="drawing" width="50%"/>

You will then be able to see when each user connected to the web application but also how
frequently they are connecting to it.

<img src="https://user-images.githubusercontent.com/61495584/139655770-77785905-cab1-4f18-b5e7-e81bd330cf14.png" alt="drawing" width="50%"/>










