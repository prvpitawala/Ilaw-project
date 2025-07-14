import { NotificationManager } from "./Manager/NotificationManager.js";
import { OverlayManager } from "./Manager/OverlayManager.js";
import { UIManager } from './Manager/UIManager.js';
import { Registration } from  './Sections/Registration.js';
import { Dashboard } from  './Sections/Dashboard.js';
import { CollectionAdd } from "./Sections/CollectionAdd.js";
import { Massage } from  './Sections/Massage.js';
import { DocumentAdd } from "./Sections/DocumentAdd.js";
import { Setting } from "./Sections/Setting.js";

const notificationManager = new NotificationManager();
const overlayManager = new OverlayManager(notificationManager);
const uiManager = new UIManager(notificationManager);

const registerComponant = new Registration(notificationManager,uiManager);
const dashboardComponant = new Dashboard(notificationManager,overlayManager,uiManager);
const collectionAddComponant = new CollectionAdd(notificationManager,overlayManager,uiManager);
const messageComponant = new Massage(notificationManager,overlayManager,uiManager);
const documentAddComponant = new DocumentAdd(notificationManager,overlayManager,uiManager);
const settingComponant = new Setting(notificationManager,overlayManager,uiManager);

window.onload = async function() {
    uiManager.registerComponent(registerComponant,'registration-card');
    uiManager.registerComponent(dashboardComponant, 'dashboard');
    uiManager.registerComponent(collectionAddComponant, 'collection-add-card');
    uiManager.registerComponent(messageComponant, 'message-card');
    uiManager.registerComponent(documentAddComponant, 'document-add-card');
    uiManager.registerComponent(settingComponant, 'settings-card');

    const profile = await api.getProfileName('token Raveen2244');
    profile.ok === true ? uiManager.navigateToView('dashboard','dashboard') : uiManager.navigateToView('registration-card','register');
};