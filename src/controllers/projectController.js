// src/controllers/projectController.js
import ProjectResource from '../resources/projectresource.js';
import db from '../models/index.js';
import JWT from "jsonwebtoken";
import { sendMessageToGPT } from '../services/gptService.js';

import fs from 'fs';
import path from 'path';
import { generateThumbnail, ensureDirExists } from '../utils/generateThumbnail.js';
import { fileURLToPath } from 'url';

import { sendMessage } from './chat.controller.js';
// const Project = db.Project;
// const Chat = db.Chat;

const createProject = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            try {
                const { appIdea, targettedAudience, projectName } = req.body;
                console.log("Received data ", req.body)
                const project = await db.Project.create({
                    appIdea,
                    targettedAudience,
                    projectName,
                    userId: authData.user.id
                });

                let prompt = `Your name is Neo and technical cofounder and developer. 

You're assisting entrepreneurs in refining and developing their app ideas using React Native on Snack Expo. Neo will leverage the full capabilities of React Native and the UI component libraries provided by Snack Expo. At each step, Neo engages with the founders to confirm the direction of the app idea, thinking through use cases, features, monetization strategies, and more. Founders can provide feedback and modify suggestions to align with their vision. Remember, you're a technical co-founder as well, so think critically about the suggested features and use cases. Don't just accept the user feedback but also challenge and give direction and your creative/technical reasoning as to why you suggest such things. Make sure you get feedback from the users that are building their app at each of the steps. For example, ea step needs a response from the founder before you continue. 

Follow these steps one at a time to construct the app idea:

Step:What type of app are you looking to build? (Based on this answer, you will prepopulate personas, features, use cases, revenue models, UI/UX, core screens, and more.)
(STOP, WAIT FOR RESPONSE)

Step: What's the app name? If not, provide 3 possible names with creative reason.  
(STOP, WAIT FOR RESPONSE)

Step: Lets analyze the app.
Is the idea unique, does it solve a real world problem and could it be profitable? Include some suggestions to enhance the app idea by telling the user to consider adding/removing parts of the app. 
(STOP, WAIT FOR RESPONSE)

Step: Let's check the web for competitors 
Conduct a market analysis by searching the web and listing out top 3 competitors, what differentiates them, company value, marketshare, website.
(STOP, WAIT FOR RESPONSE)
 
Step: Lets define your users. 
Define Unique User Personas and make suggestions based on the app type provided. 
Example Format:
Persona A: [Detailed description]
Persona B: [Detailed description]
Admin: [Detailed description]
(STOP, WAIT FOR RESPONSE)

Step: Define Use Cases (Explain what a use case is, then list out all common use cases for ea persona) 
Example Format:
Persona 1 (Driver):
As a Driver, I want to accept ride requests to earn money.
(STOP, WAIT FOR RESPONSE)

Step: Revenue Models (Based on the app idea and personas, make some strong and popular suggestions)  
Example Revenue Models:
Freemium: Basic features are free, premium features require a subscription.
In-app Purchases: Users can buy additional features or content.
Subscription: Users pay a recurring fee for continued access to premium features.
Ads: The app displays ads to generate revenue.
(STOP, WAIT FOR RESPONSE)

Step: Core Features (Create a table for each main persona with core features and their intended actions/use cases. Rate from very important to least important) 
Example Format:
Driver Features:
Core Features	Intended Action / Use Case / Importance Level 
Accept Ride Requests: To earn money by providing rides
Track Earnings: To manage and review financial performance
Navigation Integration	:To find and follow the best routes to destinations
Ride History: To review past rides for any discrepancies or records
(STOP, WAIT FOR RESPONSE)

Step: UI/UX Design
What UI style do you prefer for your app? (Feel free to add options outside of what's listed below.)
Futuristic
Sleek
Minimalist
Web 3
AI

Based on the UI selection, use the following UI component libraries for design elements:
NativeWind https://www.nativewind.dev/
React Native Elements https://reactnativeelements.com/docs/components/avatar
React Native Paper https://callstack.github.io/react-native-paper/
(STOP, WAIT FOR RESPONSE)


Step: Main Screens
Let's list out the main screens for each persona and provide a one-sentence description of what happens on each screen.
Example Format:
Driver Main Screens:
Messages: Communicate with passengers.
Rides: View and manage current and past rides.
Earnings: Track earnings and payouts.
Notifications: Receive updates on ride requests, payments, and app alerts.
(STOP, WAIT FOR RESPONSE)

Step: Short Tab Bar Menu
Using the main screens as a guide, let's create the short tab bar menu for each persona. The menus may range from 3-5 items, each with an icon that represents the menu item. Make sure to share this image (https://miro.medium.com/v2/resize:fit:1400/1*M_O4Ifns0far8YFEhLPpeg.png) as an example and use one of the UI Component libraries to create the short tab bar options. 
Example Format:
Driver Tab Bar Menu:
Rides: Manage ride requests and history.
Earnings: Track earnings and payouts.
Messages: Communicate with passengers.
Profile: Update driver profile and settings.
(STOP, WAIT FOR RESPONSE)

Step: Color Palette
(Offer primary, seconday and thirtiary color options with hex code and creative reasoning) 
Example Format:
Primary Color Name: 
Hex:
Reasoning: 
(STOP, WAIT FOR RESPONSE)

Step: Onboarding (Note: dynamic steps in onboarding based on the app idea, it should include walkthrough screens, signIn / SignUp, create profile and 3-4 onboarding questions to better personalize the app for the user).
Example: 
Walkthrough Screens (give 3 value prop screens with ea having a screen name and a 10 word value prop):
Screen 1: Welcome
Title: Welcome to app name!
Description: Where meaningful connections begin and thrive.
Button: "Next”

Step: User Flow
After, defining the onboarding. Create a user flowchart from the initial onboarding to the core screens on the short tab bar menu to engaging with core features. Build a flow chart visualizing all the possible flows across the core screens and features. 

Step: Build Out the App in React Native (make sure to comment what ea line of code is doing. Remember, we're building this for none technical founders) 
Using all resources available at React Native (https://reactnative.dev/), and prioritizing the following UI component libraries:

NativeWind
React Native Elements
React Native Paper

I will build out the main screens, use cases, features, and user onboarding. Each file will be separated by best development standards to ensure clean code and easy organization when running on Expo Snack. At each step, I will engage with you to get your input, feedback, comments, or questions. This will be a collaborative process to ensure your vision is perfectly realized.

Here's what must include in our code: 
1. Main Screens by Persona
Each persona will have its own set of screens, with the main functionality and user interactions implemented directly on the screen.
For example, for user profile, ensure it has username, email, picture, and other essential metadata so the screen isn't empty. 
For notifications screen, make sure to show alert text, vector image and other elements / components that represents this particular main screen.
For home screen or discover screen or other main screens, be sure the screens have the core use cases, features and should not be left blank. For example, buttons, description text, elements, images, etc. 

2. Use Cases and Features (write the code for the use cases and features on the respective screen) 
Each screen should have the core features and use cases developed for each persona from the above list.
For example, a use case may be as a user I want to XYZ, this should be applied on the screen showing the button, navigation, and features involved with accomplishing the use case. 

3. User Onboarding (include a subscription screen if this app has a paid option. Consider all the nuances of an onboarding flow showing the input fields, labels, button ets to fill in the onboarding screens.) 
Write the code to build a dynamic and tailored onboarding process for the user's app, with steps specific to the app's needs.

4. Navigation
Implement navigation using React Navigation to handle screen transitions smoothly.
Setup Instructions:

You can access the example code structure in your knowledge base Step 10 Code Structure Examples.txt
Here are some of the details on the project
                App Idea: ${appIdea}
                Audience: ${targettedAudience}
                App Name: ${projectName}
##Important rules
1. Your output should be one step at a time. Don't contiunue on to the next step until the user has confirmed or given feedback on each step. 
               

`

                
                // Create a chat for the project
                const chat = await db.Chat.create({ projectId: project.id });


                //Send Message
                const response = await sendMessageToGPT(prompt, [], null);
                const gptResponse = response.choices[0];
                let promptTokens = response.usage.prompt_tokens;
                let completionTokens = response.usage.completion_tokens;


                const message = await db.Message.create({
                    content: prompt,
                    senderType: 'user',
                    chatId: chat.id,
                    userId: authData.user.id,
                    image: null,
                    imageThumb: null,
                    docUrl: null,
                    tokens: promptTokens,
                    visibility: "hidden"
                });

                const gptMessage = await db.Message.create({
                    content: gptResponse.message.content,
                    senderType: 'gpt',
                    chatId: chat.id,
                    image: null,
                    imageThumb: null,
                    docUrl: null,
                    tokens: completionTokens,
                    finishReason: gptResponse.finish_reason
                });



                res.status(200).json({ status: true, message: "Project created", data: await ProjectResource(project) });
            } catch (error) {
                res.status(500).json({ error: 'Server Error', status: false, message: error.message });
            }
        }
        else {
            res.status(500).json({ error: 'Unauthenticated user', status: false, message: "Unauthenticated user" });
        }
    })

};





export const UpdateProject = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            try {
                let projectId = req.body.projectId;
                let project = await db.Project.findByPk(projectId)
                if (project) {
                    if (req.body.projectName) {
                        project.projectName = req.body.projectName;
                    }
                    let image = null, thumbnail = null, doc = null;
                    if (req.files.media) {
                        let file = req.files.media[0];

                        const mediaBuffer = file.buffer;
                        const mediaType = file.mimetype;
                        const mediaExt = path.extname(file.originalname);
                        const mediaFilename = `${Date.now()}${mediaExt}`;
                        console.log("There is a file uploaded")
                        if (mediaType.includes('image')) {

                            // Ensure directories exist
                            let dir = process.env.DocsDir//"/var/www/neo/neoapis/uploads"//"uploads"//

                            const imageDir = path.join(dir + '/images');;//path.join(__dirname, '../../uploads/images');
                            const thumbnailDir = path.join(dir + '/thumbnails');;//path.join(__dirname, '../../uploads/thumbnails');
                            ensureDirExists(imageDir);
                            ensureDirExists(thumbnailDir);

                            // Save image
                            const imagePath = path.join(imageDir, mediaFilename);
                            fs.writeFileSync(imagePath, mediaBuffer);
                            // image = `/uploads/images/${mediaFilename}`;
                            image = `https://www.blindcircle.com:444/neo/uploads/images/${mediaFilename}`;
                            // Generate and save thumbnail
                            const thumbnailBuffer = await generateThumbnail(mediaBuffer);
                            const thumbnailFilename = `${Date.now()}_thumb${mediaExt}`;
                            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
                            fs.writeFileSync(thumbnailPath, thumbnailBuffer);
                            // thumbnail = `/uploads/thumbnails/${thumbnailFilename}`;
                            thumbnail = `https://www.blindcircle.com:444/neo/uploads/thumbnails/${thumbnailFilename}`;

                            project.projectImage = image;
                            project.projectImageThumb = thumbnail;


                        } else {

                        }
                    }
                    let saved = project.save();

                    res.status(200).json({ status: true, message: "Project updated", data: await ProjectResource(project) });
                }
                else {
                    res.status(404).json({ status: true, message: "Project not found", data: null });
                }


            } catch (error) {
                console.log("Error Create Project: ", error)
                res.status(500).json({ error: 'Server Error', status: false, message: error.message });
            }
        }
        else {
            res.status(500).json({ error: 'Unauthenticated user', status: false, message: "Unauthenticated user" });
        }
    })

};
const getUserProjects = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            try {
                // Fetch projects created by the authenticated user
                let userProjects = await db.Project.findAll({
                    where: {
                        userId: authData.user.id
                    }
                });

                // Fetch accepted invitations where the authenticated user is the invitee
                let acceptedInvitations = await db.Invitation.findAll({
                    where: {
                        toUser: authData.user.id,
                        status: 'accepted'
                    }
                });

                // Extract the IDs of the users who invited the authenticated user
                let invitingUserIds = acceptedInvitations.map(invite => invite.fromUser);

                // Fetch projects of the users who invited the authenticated user
                let invitedProjects = await db.Project.findAll({
                    where: {
                        userId: invitingUserIds
                    }
                });

                // Combine both sets of projects
                let allProjects = [...userProjects, ...invitedProjects];

                res.status(200).json({ status: true, message: "Projects retrieved successfully", data: await ProjectResource(allProjects) });
            } catch (error) {
                console.log("Error fetching projects: ", error);
                res.status(500).json({ error: 'Server Error', status: false, message: error.message });
            }
        } else {
            res.status(401).json({ error: 'Unauthenticated user', status: false, message: "Unauthenticated user" });
        }
    });
};

export { createProject, getUserProjects }
