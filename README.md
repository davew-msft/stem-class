# stem-class

Dave's Notes
-------

Recycling app.  

In chatgpt:

>I'm looking for capabilities of what you can do with your GPT models. If I give you a picture of an object. can you tell me if it is recyclable? tell me more

Output:

Yes — I can help with that. ♻️
If you upload a photo of an object, I can:


Identify the object or material (e.g., plastic bottle, aluminum can, cardboard, etc.)


Analyze recycling symbols or labels on the item (like ♻️ “1 PET” or “5 PP”)


Explain whether and how it can be recycled, based on the material and common recycling guidelines


Offer location-specific advice if you tell me your region or city (since recycling rules vary a lot)


Here’s what I can do:


Visually detect materials, textures, and packaging types.


Read and interpret printed labels or recycling codes from the image.


Cross-reference that info with local or general recycling programs.


Suggest how to prepare it for recycling (e.g., “rinse out food residue,” “remove cap,” “flatten box”).


What I can’t do directly:


I don’t have a built-in database of every city’s recycling rules — but I can look them up in real time.


I can’t confirm recyclability at a specific facility unless it’s publicly listed.


I can’t physically test materials (e.g., to tell if it’s truly biodegradable or compostable).


Would you like to try it out? You can upload a picture of the object, and I’ll walk you through whether it’s recyclable and how to dispose of it properly.

**So this seems possible**

## Vibe Coding

## Spec-Driven Development with GH Spec Kit

* https://github.com/github/spec-kit
* might be better to do _the documentation up front_ vs vibe coding which is _constant prompt refinement_.  Less _cowboy_ and more _astronaut_.  

## How to Get rescan working on this machine


```bash
open vscode

cd stem-class
cd rescan
code .
```

to update brian's code with new code....

```bash
git pull

```

if you want to send dave your changes:  

```bash
git commit -am"dave, I made changes"
git push

```


## How to Get This Working on Your Machine

Get it working on a given machine:

```bash
cd /mnt/c/brian
git clone https://github.com/davew-msft/stem-class.git
cd stem-class
sudo snap install astral-uv --classic
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init rescan
cd rescan
# open a new window with the correct context
code .
```

then in that window:  

/speckit.constitution - Establish project principles
/speckit.specify - Create baseline specification (whats and whys):


My website application is called "Rescan", which is short for "Recycling Scanner".  

# Overview
I'm building a website application that will scan a RIC (recycling symbol code) and tell the user if the given product is recyclable in their area.  For every item they enter into the website, points will be given.  The user will be able to enter their street address so that we can track the points.  The website will be able to determine if the product is recyclable given the local recycling capabilities. 

It should be: 
* sleek, something that would stand out.  
* responsive/able to run on a mobile phone or computer

If you have any questions or concerns, simply ask me clarifying questions as needed.  

## Website Navigation/Pages

### Home Page

It should say "Do you want to reduce your tax bill?  Yes or No"
* If the user clicks no then open the following video in an iframe:  https://www.youtube.com/watch?v=dQw4w9WgXcQ
* If the user clicks Next take them to the "Login" page

### Login Page

* This won't actually be a login.  The user will simply enter their street address and click submit
  * When they click submit if
    * no data is found for that address in the database then display "You have no points"
    * if data is found, display the number of points this address has earned in the database
* then ask the user "would you like to scan an item and earn points?".  This will take them to the Scan Page

### Scan Page

* A button is display to "Scan the Item".  
* When the user clicks the camera will be activated and will take a picture of the RIC symbol.  
* With the image captured we will then upload the image to a GPT-4o model, which will:
  * Send the image and the following prompt to an Azure OpenAI instance of the model
    * "Looking at the attached image, can you determine what type of material is in the image.  There should be a recycling symbol in the image, so use that.  If not, perhaps you can read the label.  Please return values like '1 PET' or '5 PP', etc.   Given the street address passed in, can you determine if that material is recyclable at that address?"
* This page will then return the type of plastic/material to the user and whether it is recyclable.  
  * If it is recyclable:  add 100 points for that address to the database table.  
  * If not, tell the user it is not recyclable and add 10 points for that address

Scanning may be difficult to do on some phones/laptops.  If so, offer the user an option to upload a jpg or png and we can simply use that instead.  


then:  

/speckit.plan - Create implementation plan 
/speckit.tasks - Generate actionable tasks
/speckit.implement           



"http://getrescan.com/"



## Sample Addresses

* 123 Main Street, Newark, NJ
* 456 Oak Avenue, Trenton, New Jersey
* 71 mt tabor way, ocean grove NJ

## Sample Recycling Scanned Images

* [almost totally illegible "5"](./samples/5.png)
* [LDPE that isn't labeled "LDPE"](./samples/ldpe.png)
* [straightforward "1"](./samples/recycle.png)