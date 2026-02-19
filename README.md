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

Get it working on a given machine:

```bash
cd stem-class
sudo snap install astral-uv --classic
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init rescan
cd rescan
# open a new window with the correct context
code .
```

/speckit.constitution - Establish project principles

                                                                                      │
│     2.2 /speckit.specify - Create baseline specification                                                                                          │
│     2.3 /speckit.plan - Create implementation plan                                                                                                │
│     2.4 /speckit.tasks - Generate actionable tasks                                                                                                │
│     2.5 /speckit.implement - Execute implementation        


│  Optional commands that you can use for your specs (improve quality & confidence)                                                                 │
│                                                                                                                                                   │
│  ○ /speckit.clarify (optional) - Ask structured questions to de-risk ambiguous areas before planning (run before /speckit.plan if used)           │
│  ○ /speckit.analyze (optional) - Cross-artifact consistency & alignment report (after /speckit.tasks, before /speckit.implement)                  │
│  ○ /speckit.checklist (optional) - Generate quality checklists to validate requirements completeness, clarity, and consistency (after             │
│  /speckit.plan)  

in the ghcp prompt:
Fill the constitution wih the bare minimum requirements for a static web app based on the template.  

* remove anything that is clearly not needed.  

the "what" and the "why"

in ghcp "/specify"

/speckit.specify 
I'm building a website application that will scan a RIC (recycling symbol code) and tell the user if the given product is recyclable in their area.  For every item they enter into the website, points will be given.  The user will be able to enter their street address so that we can track the points.  The website will be able to determine if the product is recyclable given the local recycling capabilities. 

* sleek, something that would stand out.  
* there should be a page for ..., an about page, an FAQ page

then:
* for things that need clarification use the best guess you think is reasonable.  update acceptable checklist after.  

then:  
/plan 


I am going to use Next.js and SPA, the database is pgres.  Site is responsive and ready for mobile.  

use /plan for additional requirements

then:  

follow instructions in tasks.prompt.md and break this down into tasks

then:

implement the tasks for this project and update the task list as you go.  

