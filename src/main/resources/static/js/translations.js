// FoodRescue Localization Dictionary & i18n Engine
// Supported languages: 'en' (English), 'ta' (Tamil - தமிழ்)

const translations = {
    en: {
        // App & Navigation
        "app.title": "FoodRescue",
        "app.tagline": "Smart Food Waste Management System",
        "app.copyright": "FoodRescue © 2026 Smart Food Waste Management System. All rights reserved.",
        "lang.en": "English",
        "lang.ta": "தமிழ்",
        "lang.select": "Language",

        // Auth Screen
        "auth.loginTab": "Login",
        "auth.registerTab": "Register",
        "auth.emailOrUsername": "Email or Username",
        "auth.emailOrUsernamePlaceholder": "Enter username or email",
        "auth.password": "Password",
        "auth.passwordPlaceholder": "Enter password",
        "auth.rememberMe": "Remember me",
        "auth.forgotPassword": "Forgot Password?",
        "auth.signIn": "Sign In",
        "auth.quickLogins": "Quick Demo Logins",
        "auth.admin": "Admin",
        "auth.donorHotel": "Donor (Hotel)",
        "auth.receiverShelter": "Receiver (Shelter)",
        "auth.farmer": "Farmer",

        // Registration Form
        "reg.selectRole": "Select Role",
        "reg.roleDonor": "Donor (Hotels, Bakeries, Catering)",
        "reg.roleReceiver": "Receiver (Shelters, NGO, Orphanages)",
        "reg.roleFarmer": "Farmer (Agricultural & Composting)",
        "reg.username": "Username",
        "reg.fullName": "Full Name",
        "reg.email": "Email",
        "reg.phone": "Phone",
        "reg.address": "Address / Pickup Location",
        "reg.orgName": "Organization / Hotel Name",
        "reg.orgNamePlaceholder": "e.g. ABC Grand Hotel",
        "reg.receiverOrg": "Institution / Shelter Name",
        "reg.receiverOrgPlaceholder": "e.g. Hope Haven Shelter",
        "reg.foodType": "Required Food Types",
        "reg.foodTypePlaceholder": "e.g. Cooked Meals, Rice, Grains",
        "reg.farmName": "Farm Name",
        "reg.farmNamePlaceholder": "e.g. Green Valley Organics",
        "reg.farmLocation": "Location / Region",
        "reg.landCapacity": "Capacity (e.g. 50 Acres)",
        "reg.createAccount": "Create Account",

        // Top Navbar & Header
        "nav.notifications": "Notifications",
        "nav.markAllRead": "Mark All as Read",
        "nav.noNotifications": "No new notifications",
        "nav.logout": "Logout",

        // Roles
        "role.ADMIN": "ADMIN",
        "role.DONOR": "DONOR",
        "role.RECEIVER": "RECEIVER",
        "role.FARMER": "FARMER",

        // Sidebar Navigation
        "sidebar.adminDashboard": "Admin Dashboard",
        "sidebar.allFoodTracking": "All Food Tracking",
        "sidebar.expiredFoodMgmt": "Expired Food Management",
        "sidebar.receiverFoodRequests": "Receiver Food Requests",
        "sidebar.farmerFoodRequests": "Farmer Food Requests",
        "sidebar.registeredDonors": "Registered Donors",
        "sidebar.registeredReceivers": "Registered Receivers",
        "sidebar.registeredFarmers": "Registered Farmers",
        "sidebar.fullHistory": "Full History Audit Log",
        "sidebar.reports": "Reports & Analytics",
        "sidebar.donorDashboard": "Donor Dashboard",
        "sidebar.addFood": "Add Food Donation",
        "sidebar.myDonations": "My Donated Food",
        "sidebar.availableFood": "Available Food Listings",
        "sidebar.myRequests": "My Food Requests",
        "sidebar.farmerDashboard": "Farmer Dashboard",
        "sidebar.farmerExpiredFoods": "Expired Foods Available",
        "sidebar.farmerMyRequests": "My Food Requests",

        // Admin Dashboard
        "dashboard.adminTitle": "Admin Executive Dashboard",
        "dashboard.totalDonations": "Total Donations",
        "dashboard.availableFood": "Available Food",
        "dashboard.readyForAlloc": "Ready for allocation",
        "dashboard.distributedFood": "Distributed Food",
        "dashboard.distributedKg": "{0} kg distributed",
        "dashboard.totalKg": "{0} kg total",
        "dashboard.expiredFarmerFood": "Expired / Farmer Food",
        "dashboard.redirectedFarmer": "{0} redirected to farmers",
        "dashboard.regDonors": "Registered Donors",
        "dashboard.regReceivers": "Registered Receivers",
        "dashboard.regFarmers": "Registered Farmers",
        "dashboard.chartDonatedVsDist": "Donated vs Distributed Trends (kg)",
        "dashboard.chartCategory": "Category Breakdown",
        "dashboard.chartDonatedLabel": "Donated (kg)",
        "dashboard.chartDistributedLabel": "Distributed / Saved (kg)",

        // Donor Portal
        "donor.portalTitle": "Donor Portal",
        "donor.myDonationsTitle": "My Donated Food Items",
        "donor.recordsCount": "My Donation Records ({0})",
        "donor.manageDescription": "Manage your active donations. Food can be removed only while still AVAILABLE and before any receiver requests it.",
        "donor.donateBtn": "Donate Food",
        "donor.noDonations": "No food donations yet",
        "donor.noDonationsSub": "Start by registering your first surplus food donation!",
        "donor.removeFoodTitle": "Remove Food Donation",
        "donor.removeFoodConfirm": "Are you sure you want to remove \"{0}\"? This food will be removed from your active donations.",
        "donor.removeFoodNotice": "This food will be removed from your active donations.",
        "donor.areYouSure": "Are you sure?",
        "donor.lockedNotice": "This food cannot be removed because a receiver has already requested it.",
        "donor.requestExists": "Receiver request exists",
        "donor.locked": "Locked",
        "donor.removed": "Removed",
        "donor.removeBtn": "Remove Food",

        // Add Food Modal
        "modal.addFoodTitle": "Add Food Donation",
        "modal.foodName": "Food Name",
        "modal.foodNamePlaceholder": "e.g. Basmati Rice & Veg Curry",
        "modal.foodCategory": "Food Category",
        "modal.quantity": "Quantity",
        "modal.quantityPlaceholder": "e.g. 25",
        "modal.unit": "Unit",
        "modal.unitPlaceholder": "e.g. kg, plates, boxes",
        "modal.expiryDate": "Expiry Date & Time",
        "modal.foodCondition": "Food Condition",
        "modal.foodConditionPlaceholder": "e.g. Freshly Cooked / Hot",
        "modal.storageCondition": "Storage Condition",
        "modal.storageConditionPlaceholder": "e.g. Insulated Thermal Container",
        "modal.pickupLocation": "Pickup Location",
        "modal.pickupLocationPlaceholder": "e.g. ABC Hotel Rear Dock 2",
        "modal.description": "Description / Preparation Notes",
        "modal.descriptionPlaceholder": "Provide any details about ingredients or storage guidelines",
        "modal.cancel": "Cancel",
        "modal.submitDonation": "Submit Donation",

        // Receiver Views
        "receiver.availableTitle": "Available Food Donations",
        "receiver.availableSubtitle": "Browse available food donations and submit your request for rescue and redistribution.",
        "receiver.noFoodTitle": "No Food Available Right Now",
        "receiver.noFoodSub": "Check back soon as donors register new surplus meals throughout the day.",
        "receiver.donorLabel": "Donor:",
        "receiver.availableQty": "Available:",
        "receiver.expires": "Expires:",
        "receiver.pickup": "Pickup:",
        "receiver.requestFoodBtn": "Request Food",
        "receiver.myRequestsTitle": "My Food Requests",
        "receiver.requestsCount": "My Request Tracking ({0})",
        "receiver.requestsSubtitle": "Monitor allocation, scheduled pickup times, and update completion status.",
        "receiver.noRequests": "No food requests yet",
        "receiver.noRequestsSub": "Explore available donations and make a request to rescue food!",
        "receiver.browseFoodBtn": "Browse Available Food",
        "receiver.stepRequested": "Requested",
        "receiver.stepApproved": "Approved",
        "receiver.stepAllocated": "Allocated",
        "receiver.stepReady": "Ready for Pickup",
        "receiver.stepPickedUp": "Picked Up",
        "receiver.stepCompleted": "Completed",
        "receiver.stepRejected": "Rejected",
        "receiver.pickupAt": "Pickup scheduled at:",
        "receiver.pickupLoc": "Pickup Location:",
        "receiver.markPickedUpBtn": "Mark as Picked Up",
        "receiver.markCompletedBtn": "Mark as Distributed & Complete",
        "receiver.completedSuccess": "Food successfully distributed & completed",
        "receiver.requestPrompt": "Enter quantity to request (Max: {0} {1}):",
        "receiver.requestedQtyLabel": "Requested: {0} {1}",

        // Farmer Views
        "farmer.dashboardTitle": "Farmer Bio-Recycling Dashboard",
        "farmer.expiredTitle": "Expired Food Available for Agricultural Recycling",
        "farmer.expiredSubtitle": "These food items have passed their human consumption expiry date and are exclusively reserved for organic composting, livestock feed, or bio-energy workflows.",
        "farmer.safetyAlert": "Food Safety Compliance: Expired food is strictly prohibited for human consumption. Use only for approved agricultural, composting, or livestock feed applications.",
        "farmer.requestExpiredBtn": "Request for Farming / Composting",
        "farmer.noExpired": "No Expired Food Available",
        "farmer.noExpiredSub": "Currently there are no expired food items available for redirection.",
        "farmer.myRequestsTitle": "My Agricultural Requests ({0})",
        "farmer.myRequestsSubtitle": "Track the status of your bio-recycling and composting requests.",
        "farmer.noRequests": "No farmer requests found",
        "farmer.noRequestsSub": "Request expired food items to help complete the zero-waste circular loop!",
        "farmer.browseExpiredBtn": "Browse Expired Food",
        "farmer.reason": "Reason:",
        "farmer.status": "Status:",
        "farmer.markCollectedBtn": "Confirm Collected",
        "farmer.markCompletedBtn": "Mark Composted / Completed",
        "farmer.completedNotice": "Composting / Bio-Recycling Completed",
        "farmer.statBioRecycled": "Total Bio-Recycled (kg)",
        "farmer.statComposted": "Composted & Utilized",
        "farmer.statActiveReq": "Active Requests",
        "farmer.statUnderReview": "Under Review / Assigned",
        "farmer.statExpiredAvailable": "Expired Available (kg)",
        "farmer.statAwaitingRedirect": "Awaiting Redirection",
        "farmer.quickActionHeader": "Agricultural Circular Economy Actions",
        "farmer.quickActionDesc": "Connect with surplus food streams that have passed consumer expiry to convert waste into fertile compost, organic soil nutrients, and bio-gas energy.",

        // Farmer Request Modal
        "modal.farmerReqTitle": "Request Expired Food",
        "modal.farmerReqFoodItem": "Expired Food Item",
        "modal.farmerReqAvailable": "Available Quantity",
        "modal.farmerReqQty": "Requested Quantity",
        "modal.farmerReqReason": "Reason / Intended Approved Use",
        "modal.reasonCompost": "Organic Soil Composting",
        "modal.reasonBiogas": "Bio-gas / Bio-energy Generation",
        "modal.reasonLivestock": "Livestock / Animal Feed (Regulatory Approved)",
        "modal.reasonEnrichment": "Agricultural Soil Enrichment",
        "modal.reasonOther": "Other Approved Non-Human Workflow",
        "modal.submitToAdmin": "Submit Request to Admin",

        // Admin Management Views
        "admin.foodRecordsTitle": "Food Inventory & Tracking Records",
        "admin.foodRecordsSubtitle": "Complete audit list of all registered food donations across all donors and lifecycles.",
        "admin.filterAll": "All ({0})",
        "admin.filterAvailable": "Available ({0})",
        "admin.filterRequested": "Requested ({0})",
        "admin.filterAllocated": "Allocated ({0})",
        "admin.filterDistributed": "Distributed ({0})",
        "admin.filterExpired": "Expired ({0})",
        "admin.filterFarmer": "Sent to Farmer ({0})",
        "admin.expiredMgmtTitle": "Expired Food Management & Farmer Redirection",
        "admin.expiredMgmtSubtitle": "Manage expired inventory safely. Expired food is strictly barred from human redistribution and must be redirected to registered farmers for composting or bio-recycling.",
        "admin.safetyRuleBanner": "Food Safety Compliance: Expired food cannot be distributed to human receivers. It must be redirected exclusively to registered farmers or composting facilities.",
        "admin.sendToFarmerBtn": "Send to Farmer",
        "admin.alreadySentFarmer": "Sent to Farmer",
        "admin.noExpiredAdmin": "No Expired Food in the System",
        "admin.noExpiredAdminSub": "All active inventory is either fresh or has already been redistributed / redirected.",
        "admin.receiverReqTitle": "Receiver Food Requests Management",
        "admin.receiverReqSubtitle": "Review, approve, and allocate food donations to registered shelters, NGOs, and charity institutions.",
        "admin.noReceiverReq": "No Receiver Food Requests Found",
        "admin.noReceiverReqSub": "When charity institutions request available food items, they will appear here for review.",
        "admin.farmerReqTitle": "Farmer Expired Food Requests Management",
        "admin.farmerReqSubtitle": "Review, approve, and assign expired food items to registered agricultural farmers for composting and organic recycling.",
        "admin.noFarmerReq": "No Farmer Requests Found",
        "admin.noFarmerReqSub": "When farmers request expired food for composting, requests will appear here for approval.",
        "admin.donorsTitle": "Registered Donors",
        "admin.receiversTitle": "Registered Receivers",
        "admin.farmersTitle": "Registered Farmers",
        "admin.allHistoryTitle": "System-Wide Food Lifecycle Audit Trail",
        "admin.allHistorySubtitle": "Full immutable history of all state transitions, creations, requests, allocations, and safety completions.",
        "admin.noHistory": "No history records found",
        "admin.reportsTitle": "System Impact Reports & Analytics",
        "admin.monthlyReport": "Monthly Waste Reduction & Rescue Report",
        "admin.exportCsv": "Export Report (CSV)",
        "admin.totalDonated": "Total Donated",
        "admin.totalDistributed": "Total Distributed",
        "admin.sentToFarmers": "Sent to Farmers",
        "admin.wasteReduction": "Waste Reduction %",
        "admin.foodSavedFromLandfill": "{0} kg food saved from landfill",

        // Admin Modals & Action Dialogs
        "modal.allocateReceiverTitle": "Allocate Food to Receiver",
        "modal.foodAndReceiver": "Food Item & Receiver",
        "modal.scheduledPickupDate": "Scheduled Pickup Date & Time",
        "modal.confirmAllocation": "Confirm Allocation",
        "modal.sendToFarmerTitle": "Send Expired Food to Farmer",
        "modal.selectFarmer": "Select Farmer",
        "modal.loadingFarmers": "Loading farmers...",
        "modal.recyclingNotes": "Notes / Recycling Guidelines",
        "modal.recyclingNotesPlaceholder": "e.g. For soil composting",
        "modal.assignToFarmer": "Assign to Farmer",
        "modal.auditTrailTitle": "Food Lifecycle Audit Trail",
        "modal.foodItemHistory": "Food Item:",
        "modal.code": "Code:",
        "modal.currentStatus": "Current Status:",
        "modal.noHistoryFood": "No history events found for this food item.",

        // Table Columns & Common Labels
        "th.code": "Code",
        "th.foodName": "Food Name",
        "th.category": "Category",
        "th.quantity": "Quantity",
        "th.remaining": "Remaining",
        "th.expiryDate": "Expiry Date",
        "th.status": "Status",
        "th.actions": "Actions",
        "th.donor": "Donor",
        "th.receiver": "Receiver",
        "th.requestedQty": "Requested Qty",
        "th.requestedDate": "Requested Date",
        "th.farmer": "Farmer",
        "th.intendedUse": "Intended Use",
        "th.action": "Action",
        "th.prevStatus": "Previous Status",
        "th.newStatus": "New Status",
        "th.performedBy": "Performed By",
        "th.timestamp": "Timestamp",
        "th.remarks": "Remarks",
        "th.org": "Organization",
        "th.fullName": "Full Name",
        "th.email": "Email",
        "th.phone": "Phone",
        "th.address": "Address",
        "th.institution": "Institution / Shelter",
        "th.reqFood": "Required Food",
        "th.farmName": "Farm Name",
        "th.location": "Location",
        "th.capacity": "Capacity",

        // Table Action Buttons
        "btn.viewHistory": "View Audit Trail",
        "btn.approve": "Approve",
        "btn.allocate": "Allocate",
        "btn.readyForPickup": "Ready for Pickup",
        "btn.reject": "Reject",
        "btn.redirectFarmer": "Redirect to Farmer",
        "btn.confirm": "Confirm",
        "btn.cancel": "Cancel",
        "btn.save": "Save",
        "btn.close": "Close",

        // Food Categories
        "category.COOKED_FOOD": "Cooked Food",
        "category.FRUITS": "Fruits",
        "category.VEGETABLES": "Vegetables",
        "category.RICE": "Rice",
        "category.GRAINS": "Grains",
        "category.BAKERY": "Bakery",
        "category.DAIRY": "Dairy",
        "category.PACKAGED_FOOD": "Packaged Food",
        "category.OTHER": "Other",

        // Status Badges
        "status.AVAILABLE": "AVAILABLE",
        "status.REQUESTED": "REQUESTED",
        "status.APPROVED": "APPROVED",
        "status.ALLOCATED": "ALLOCATED",
        "status.READY_FOR_PICKUP": "READY FOR PICKUP",
        "status.PICKED_UP": "PICKED UP",
        "status.DISTRIBUTED": "DISTRIBUTED",
        "status.EXPIRED": "EXPIRED",
        "status.SENT_TO_FARMER": "SENT TO FARMER",
        "status.COMPLETED": "COMPLETED",
        "status.REMOVED": "REMOVED",
        "status.REJECTED": "REJECTED",
        "status.PENDING": "PENDING",
        "status.ACCEPTED": "ACCEPTED",
        "status.ASSIGNED": "ASSIGNED",
        "status.COLLECTED": "COLLECTED",

        // Toasts & Alerts
        "toast.welcome": "Welcome back, {0}",
        "toast.loginFailed": "Login failed. Please check credentials.",
        "toast.registerSuccess": "Account registered successfully!",
        "toast.registerFailed": "Registration failed: {0}",
        "toast.foodAdded": "Food donation registered successfully (Status: AVAILABLE)!",
        "toast.foodAddError": "Error adding food: {0}",
        "toast.foodRemoved": "Food donation removed successfully.",
        "toast.foodRemoveError": "Error removing food: {0}",
        "toast.farmerReqSubmitted": "Request submitted to Admin for bio-recycling approval.",
        "toast.farmerReqError": "Failed to submit request: {0}",
        "toast.farmerApproved": "Farmer request approved & assigned.",
        "toast.farmerRejected": "Farmer request rejected.",
        "toast.farmerCollected": "Food marked as collected by farmer.",
        "toast.farmerCompleted": "Composting / Bio-recycling marked as completed!",
        "toast.requestSubmitted": "Food request submitted successfully! Awaiting admin approval.",
        "toast.requestError": "Failed to submit food request: {0}",
        "toast.requestApproved": "Request approved successfully.",
        "toast.requestAllocated": "Food successfully allocated to receiver!",
        "toast.readyForPickup": "Receiver notified that food is ready for pickup!",
        "toast.requestRejected": "Request has been rejected.",
        "toast.pickedUp": "Food marked as picked up!",
        "toast.completed": "Food marked as completed & distributed to those in need!",
        "toast.sentToFarmerSuccess": "Expired food successfully assigned to farmer for agricultural recycling!",
        "toast.allNotifRead": "All notifications marked as read",
        "toast.notifReadFail": "Failed to mark all as read",
        "toast.sessionExpired": "Session expired. Please log in again.",
        "toast.enterValidQty": "Please enter a valid quantity between 1 and {0} {1}",
        "toast.enterReason": "Please select a reason.",
        "toast.fillAllFields": "Please fill in all required fields.",
        "toast.rejectConfirm": "Are you sure you want to reject this request?"
    },

    ta: {
        // App & Navigation
        "app.title": "FoodRescue",
        "app.tagline": "அறிவார்ந்த உணவு வீணடிப்பு மேலாண்மை அமைப்பு",
        "app.copyright": "FoodRescue © 2026 அறிவார்ந்த உணவு வீணடிப்பு மேலாண்மை அமைப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
        "lang.en": "English",
        "lang.ta": "தமிழ்",
        "lang.select": "மொழி",

        // Auth Screen
        "auth.loginTab": "உள்நுழைக",
        "auth.registerTab": "பதிவு செய்க",
        "auth.emailOrUsername": "மின்னஞ்சல் அல்லது பயனர்பெயர்",
        "auth.emailOrUsernamePlaceholder": "பயனர்பெயர் அல்லது மின்னஞ்சலை உள்ளிடவும்",
        "auth.password": "கடவுச்சொல்",
        "auth.passwordPlaceholder": "கடவுச்சொல்லை உள்ளிடவும்",
        "auth.rememberMe": "என்னை நினைவில் கொள்க",
        "auth.forgotPassword": "கடவுச்சொல் மறந்துவிட்டதா?",
        "auth.signIn": "உள்நுழைக",
        "auth.quickLogins": "விரைவு மாதிரி உள்நுழைவுகள்",
        "auth.admin": "நிர்வாகி",
        "auth.donorHotel": "நன்கொடையாளர் (ஹோட்டல்)",
        "auth.receiverShelter": "பெறுநர் (காப்பகம்)",
        "auth.farmer": "விவசாயி",

        // Registration Form
        "reg.selectRole": "பங்கினைத் தேர்ந்தெடுக்கவும்",
        "reg.roleDonor": "நன்கொடையாளர் (ஹோட்டல்கள், பேக்கரிகள், கேட்டரிங்)",
        "reg.roleReceiver": "பெறுநர் (காப்பகங்கள், தன்னார்வ தொண்டு நிறுவனங்கள்)",
        "reg.roleFarmer": "விவசாயி (விவசாயம் & மண்புழு உரம் தயாரிப்பு)",
        "reg.username": "பயனர்பெயர்",
        "reg.fullName": "முழுப் பெயர்",
        "reg.email": "மின்னஞ்சல்",
        "reg.phone": "தொலைபேசி எண்",
        "reg.address": "முகவரி / எடுக்கும் இடம்",
        "reg.orgName": "நிறுவனம் / ஹோட்டல் பெயர்",
        "reg.orgNamePlaceholder": "எ.கா. ஏபிசி கிராண்ட் ஹோட்டல்",
        "reg.receiverOrg": "நிறுவனம் / காப்பகம் பெயர்",
        "reg.receiverOrgPlaceholder": "எ.கா. ஹோப் ஹேவன் காப்பகம்",
        "reg.foodType": "தேவைப்படும் உணவு வகைகள்",
        "reg.foodTypePlaceholder": "எ.கா. சமைத்த உணவு, சாதம், தானியங்கள்",
        "reg.farmName": "பண்ணை பெயர்",
        "reg.farmNamePlaceholder": "எ.கா. கிரீன் வேலி ஆர்கானிக்ஸ்",
        "reg.farmLocation": "இடம் / பகுதி",
        "reg.landCapacity": "நில அளவு / திறன் (எ.கா. 50 ஏக்கர்)",
        "reg.createAccount": "கணக்கை உருவாக்கு",

        // Top Navbar & Header
        "nav.notifications": "அறிவிப்புகள்",
        "nav.markAllRead": "அனைத்தையும் படித்ததாகக் குறி",
        "nav.noNotifications": "புதிய அறிவிப்புகள் இல்லை",
        "nav.logout": "வெளியேறு",

        // Roles
        "role.ADMIN": "நிர்வாகி",
        "role.DONOR": "நன்கொடையாளர்",
        "role.RECEIVER": "பெறுநர்",
        "role.FARMER": "விவசாயி",

        // Sidebar Navigation
        "sidebar.adminDashboard": "நிர்வாகி கட்டுப்பாட்டகம்",
        "sidebar.allFoodTracking": "அனைத்து உணவு கண்காணிப்பு",
        "sidebar.expiredFoodMgmt": "காலாவதியான உணவு மேலாண்மை",
        "sidebar.receiverFoodRequests": "பெறுநர் உணவு கோரிக்கைகள்",
        "sidebar.farmerFoodRequests": "விவசாயி உணவு கோரிக்கைகள்",
        "sidebar.registeredDonors": "பதிவுசெய்த நன்கொடையாளர்கள்",
        "sidebar.registeredReceivers": "பதிவுசெய்த பெறுநர்கள்",
        "sidebar.registeredFarmers": "பதிவுசெய்த விவசாயிகள்",
        "sidebar.fullHistory": "முழு வரலாற்றுப் பதிவு",
        "sidebar.reports": "அறிக்கைகள் & பகுப்பாய்வு",
        "sidebar.donorDashboard": "நன்கொடையாளர் கட்டுப்பாட்டகம்",
        "sidebar.addFood": "உணவைச் சேர்க்கவும்",
        "sidebar.myDonations": "எனது உணவு நன்கொடைகள்",
        "sidebar.availableFood": "கிடைக்கும் உணவுப் பட்டியல்",
        "sidebar.myRequests": "எனது உணவு கோரிக்கைகள்",
        "sidebar.farmerDashboard": "விவசாயி கட்டுப்பாட்டகம்",
        "sidebar.farmerExpiredFoods": "கிடைக்கும் காலாவதியான உணவுகள்",
        "sidebar.farmerMyRequests": "எனது உணவு கோரிக்கைகள்",

        // Admin Dashboard
        "dashboard.adminTitle": "நிர்வாகி முதன்மை கட்டுப்பாட்டகம்",
        "dashboard.totalDonations": "மொத்த நன்கொடைகள்",
        "dashboard.availableFood": "கிடைக்கும் உணவு",
        "dashboard.readyForAlloc": "ஒதுக்கீட்டிற்கு தயார்",
        "dashboard.distributedFood": "விநியோகிக்கப்பட்ட உணவு",
        "dashboard.distributedKg": "{0} கிலோ விநியோகிக்கப்பட்டது",
        "dashboard.totalKg": "மொத்தம் {0} கிலோ",
        "dashboard.expiredFarmerFood": "காலாவதியான / விவசாயி உணவு",
        "dashboard.redirectedFarmer": "{0} விவசாயிகளுக்கு அனுப்பப்பட்டது",
        "dashboard.regDonors": "பதிவுசெய்த நன்கொடையாளர்கள்",
        "dashboard.regReceivers": "பதிவுசெய்த பெறுநர்கள்",
        "dashboard.regFarmers": "பதிவுசெய்த விவசாயிகள்",
        "dashboard.chartDonatedVsDist": "நன்கொடை vs விநியோக போக்குகள் (கிலோ)",
        "dashboard.chartCategory": "உணவு வகை வாரியான விவரம்",
        "dashboard.chartDonatedLabel": "நன்கொடை (கிலோ)",
        "dashboard.chartDistributedLabel": "விநியோகிக்கப்பட்டது / காப்பாற்றப்பட்டது (கிலோ)",

        // Donor Portal
        "donor.portalTitle": "நன்கொடையாளர் தளம்",
        "donor.myDonationsTitle": "எனது உணவு நன்கொடைகள்",
        "donor.recordsCount": "எனது நன்கொடை பதிவுகள் ({0})",
        "donor.manageDescription": "உங்கள் நேரடி நன்கொடைகளை நிர்வகிக்கவும். உணவு 'கிடைக்கிறது' நிலையில் இருக்கும்போதும், பெறுநர் கோருவதற்கு முன்னரும் மட்டுமே நீக்க முடியும்.",
        "donor.donateBtn": "உணவு நன்கொடை அளிக்கவும்",
        "donor.noDonations": "இன்னும் உணவு நன்கொடைகள் இல்லை",
        "donor.noDonationsSub": "உங்கள் முதல் உபரி உணவு நன்கொடையைப் பதிவு செய்து தொடங்குங்கள்!",
        "donor.removeFoodTitle": "உணவு நன்கொடையை நீக்கு",
        "donor.removeFoodConfirm": "\"{0}\" உணவை நிச்சயமாக நீக்க விரும்புகிறீர்களா? இது செயலில் உள்ள நன்கொடைகளில் இருந்து அகற்றப்படும்.",
        "donor.removeFoodNotice": "இந்த உணவு உங்கள் செயலில் உள்ள நன்கொடைகளில் இருந்து நீக்கப்படும்.",
        "donor.areYouSure": "நீங்கள் உறுதியாக இருக்கிறீர்களா?",
        "donor.lockedNotice": "ஒரு பெறுநர் ஏற்கனவே கோரியுள்ளதால் இந்த உணவை நீக்க முடியாது.",
        "donor.requestExists": "பெறுநர் கோரிக்கை உள்ளது",
        "donor.locked": "பூட்டப்பட்டது",
        "donor.removed": "நீக்கப்பட்டது",
        "donor.removeBtn": "உணவை நீக்கு",

        // Add Food Modal
        "modal.addFoodTitle": "உணவு நன்கொடையைச் சேர்க்கவும்",
        "modal.foodName": "உணவுப் பெயர்",
        "modal.foodNamePlaceholder": "எ.கா. பாசுமதி சாதம் & காய்கறி குழம்பு",
        "modal.foodCategory": "உணவு வகை",
        "modal.quantity": "அளவு",
        "modal.quantityPlaceholder": "எ.கா. 25",
        "modal.unit": "அலகு",
        "modal.unitPlaceholder": "எ.கா. கிலோ, தட்டுகள், பெட்டிகள்",
        "modal.expiryDate": "காலாவதி தேதி & நேரம்",
        "modal.foodCondition": "உணவின் நிலை",
        "modal.foodConditionPlaceholder": "எ.கா. புதிதாக சமைக்கப்பட்டது / சூடானது",
        "modal.storageCondition": "சேமிப்பு முறை",
        "modal.storageConditionPlaceholder": "எ.கா. வெப்ப காப்புப் பெட்டி",
        "modal.pickupLocation": "எடுக்கும் இடம்",
        "modal.pickupLocationPlaceholder": "எ.கா. ஏபிசி ஹோட்டல் பின்புறம்",
        "modal.description": "விளக்கம் / தயாரிப்பு குறிப்புகள்",
        "modal.descriptionPlaceholder": "பொருட்கள் அல்லது சேமிப்பு வழிகாட்டுதல்கள் பற்றிய விவரங்கள்",
        "modal.cancel": "ரத்து செய்",
        "modal.submitDonation": "நன்கொடையை சமர்ப்பி",

        // Receiver Views
        "receiver.availableTitle": "கிடைக்கும் உணவு நன்கொடைகள்",
        "receiver.availableSubtitle": "கிடைக்கும் உணவு நன்கொடைகளைப் பார்வையிட்டு மறுவிநியோகத்திற்காக உங்கள் கோரிக்கையைச் சமர்ப்பிக்கவும்.",
        "receiver.noFoodTitle": "தற்போது உணவு எதுவும் கிடைக்கவில்லை",
        "receiver.noFoodSub": "நன்கொடையாளர்கள் புதிய உபரி உணவுகளைப் பதிவு செய்யும் போது மீண்டும் சரிபார்க்கவும்.",
        "receiver.donorLabel": "நன்கொடையாளர்:",
        "receiver.availableQty": "கிடைக்கும் அளவு:",
        "receiver.expires": "காலாவதி:",
        "receiver.pickup": "இடம்:",
        "receiver.requestFoodBtn": "உணவைக் கோரு",
        "receiver.myRequestsTitle": "எனது உணவு கோரிக்கைகள்",
        "receiver.requestsCount": "எனது கோரிக்கை கண்காணிப்பு ({0})",
        "receiver.requestsSubtitle": "ஒதுக்கீடு, திட்டமிடப்பட்ட எடுக்கும் நேரம் ஆகியவற்றைக் கண்காணித்து நிலையைப் புதுப்பிக்கவும்.",
        "receiver.noRequests": "இன்னும் உணவு கோரிக்கைகள் இல்லை",
        "receiver.noRequestsSub": "கிடைக்கும் உணவுகளைப் பார்வையிட்டு உணவைக் காப்பாற்றக் கோரிக்கை விடுக்கவும்!",
        "receiver.browseFoodBtn": "கிடைக்கும் உணவுகளைப் பார்",
        "receiver.stepRequested": "கோரப்பட்டது",
        "receiver.stepApproved": "அங்கீகரிக்கப்பட்டது",
        "receiver.stepAllocated": "ஒதுக்கப்பட்டது",
        "receiver.stepReady": "எடுக்க தயார்",
        "receiver.stepPickedUp": "எடுக்கப்பட்டது",
        "receiver.stepCompleted": "முடிந்தது",
        "receiver.stepRejected": "நிராகரிக்கப்பட்டது",
        "receiver.pickupAt": "திட்டமிடப்பட்ட எடுக்கும் நேரம்:",
        "receiver.pickupLoc": "எடுக்கும் இடம்:",
        "receiver.markPickedUpBtn": "எடுத்துச் செல்லப்பட்டதாகக் குறி",
        "receiver.markCompletedBtn": "விநியோகிக்கப்பட்டு முடிந்ததாகக் குறி",
        "receiver.completedSuccess": "உணவு வெற்றிகரமாக விநியோகிக்கப்பட்டு முடிவடைந்தது",
        "receiver.requestPrompt": "கோர வேண்டிய அளவை உள்ளிடவும் (அதிகபட்சம்: {0} {1}):",
        "receiver.requestedQtyLabel": "கோரப்பட்டது: {0} {1}",

        // Farmer Views
        "farmer.dashboardTitle": "விவசாயி மறுசுழற்சி கட்டுப்பாட்டகம்",
        "farmer.expiredTitle": "விவசாய மறுசுழற்சிக்குக் கிடைக்கும் காலாவதியான உணவு",
        "farmer.expiredSubtitle": "இந்த உணவுப் பொருட்கள் மனித நுகர்வுக்கான காலாவதி தேதியைக் கடந்துவிட்டதால், மண்புழு உரம் தயாரிப்பு, கால்நடை தீவனம் அல்லது உயிரி எரிவாயு பயன்பாட்டிற்கு மட்டுமே ஒதுக்கப்பட்டுள்ளன.",
        "farmer.safetyAlert": "உணவு பாதுகாப்பு விதிமுறை: காலாவதியான உணவை மனிதர்கள் உண்பது கண்டிப்பாகத் தடைசெய்யப்பட்டுள்ளது. அங்கீகரிக்கப்பட்ட விவசாயம், உரம் தயாரிப்பு பணிகளுக்கு மட்டுமே பயன்படுத்த வேண்டும்.",
        "farmer.requestExpiredBtn": "விவசாயம் / உரத்திற்கு கோரிக்கை விடுக்கவும்",
        "farmer.noExpired": "காலாவதியான உணவு எதுவும் கிடைக்கவில்லை",
        "farmer.noExpiredSub": "தற்போது விவசாயிகளுக்கு அனுப்பக்கூடிய காலாவதியான உணவு எதுவும் இல்லை.",
        "farmer.myRequestsTitle": "எனது விவசாயக் கோரிக்கைகள் ({0})",
        "farmer.myRequestsSubtitle": "உங்கள் உரம் தயாரிப்பு மற்றும் உயிரி மறுசுழற்சிக் கோரிக்கைகளின் நிலையைக் கண்காணிக்கவும்.",
        "farmer.noRequests": "விவசாயக் கோரிக்கைகள் எதுவும் இல்லை",
        "farmer.noRequestsSub": "பூஜ்ஜிய-கழிவு சுழற்சியை முழுமையாக்க காலாவதியான உணவுகளைக் கோருங்கள்!",
        "farmer.browseExpiredBtn": "காலாவதியான உணவுகளைப் பார்",
        "farmer.reason": "காரணம்:",
        "farmer.status": "நிலை:",
        "farmer.markCollectedBtn": "சேகரித்ததை உறுதிப்படுத்து",
        "farmer.markCompletedBtn": "உரமாக்கல் முடிந்ததாகக் குறி",
        "farmer.completedNotice": "உரமாக்கல் / உயிரி மறுசுழற்சி நிறைவடைந்தது",
        "farmer.statBioRecycled": "மறுசுழற்சி செய்யப்பட்டது (கிலோ)",
        "farmer.statComposted": "உரமாக்கப்பட்டு பயன்படுத்தப்பட்டது",
        "farmer.statActiveReq": "செயலில் உள்ள கோரிக்கைகள்",
        "farmer.statUnderReview": "பரிசீலனையில் / ஒதுக்கப்பட்டது",
        "farmer.statExpiredAvailable": "கிடைக்கும் காலாவதியான உணவு (கிலோ)",
        "farmer.statAwaitingRedirect": "ஒதுக்கீட்டிற்கு காத்திருக்கிறது",
        "farmer.quickActionHeader": "விவசாய சுழற்சிப் பொருளாதார நடவடிக்கைகள்",
        "farmer.quickActionDesc": "வீணாகும் உணவுகளை வளமான இயற்கை உரம் மற்றும் உயிரி வாயுவாக மாற்ற உபரி உணவு வழிகளுடன் இணையுங்கள்.",

        // Farmer Request Modal
        "modal.farmerReqTitle": "காலாவதியான உணவைக் கோருங்கள்",
        "modal.farmerReqFoodItem": "காலாவதியான உணவுப் பொருள்",
        "modal.farmerReqAvailable": "கிடைக்கும் அளவு",
        "modal.farmerReqQty": "கோரப்படும் அளவு",
        "modal.farmerReqReason": "காரணம் / அங்கீகரிக்கப்பட்ட பயன்பாடு",
        "modal.reasonCompost": "இயற்கை மண்புழு உரம் தயாரித்தல்",
        "modal.reasonBiogas": "உயிரி எரிவாயு தயாரிப்பு",
        "modal.reasonLivestock": "கால்நடை தீவனம் (அங்கீகரிக்கப்பட்டது)",
        "modal.reasonEnrichment": "விவசாய மண் வளப்படுத்துதல்",
        "modal.reasonOther": "பிற அங்கீகரிக்கப்பட்ட பயன்பாடு",
        "modal.submitToAdmin": "நிர்வாகியிடம் கோரிக்கையைச் சமர்ப்பி",

        // Admin Management Views
        "admin.foodRecordsTitle": "உணவு சரக்கு & கண்காணிப்பு பதிவுகள்",
        "admin.foodRecordsSubtitle": "அனைத்து நன்கொடையாளர்களின் உணவு நன்கொடைகள் மற்றும் நிலைகளின் முழுமையான தணிக்கைப் பட்டியல்.",
        "admin.filterAll": "அனைத்தும் ({0})",
        "admin.filterAvailable": "கிடைக்கிறது ({0})",
        "admin.filterRequested": "கோரப்பட்டது ({0})",
        "admin.filterAllocated": "ஒதுக்கப்பட்டது ({0})",
        "admin.filterDistributed": "விநியோகிக்கப்பட்டது ({0})",
        "admin.filterExpired": "காலாவதியானது ({0})",
        "admin.filterFarmer": "விவசாயிக்கு அனுப்பப்பட்டது ({0})",
        "admin.expiredMgmtTitle": "காலாவதியான உணவு மேலாண்மை & விவசாயிக்கு மாற்றுதல்",
        "admin.expiredMgmtSubtitle": "காலாவதியான சரக்குகளைப் பாதுகாப்பாக நிர்வகிக்கவும். மனித பயன்பாட்டிற்கு முற்றிலும் தடைசெய்யப்பட்டு விவசாயிகளுக்கு மட்டுமே அனுப்பப்படும்.",
        "admin.safetyRuleBanner": "உணவு பாதுகாப்பு விதி: காலாவதியான உணவை மனிதர்களுக்கு விநியோகிக்க முடியாது. பதிவுசெய்யப்பட்ட விவசாயிகள் அல்லது உரம் தயாரிக்கும் நிலையங்களுக்கு மட்டுமே அனுப்பப்பட வேண்டும்.",
        "admin.sendToFarmerBtn": "விவசாயிக்கு அனுப்பு",
        "admin.alreadySentFarmer": "விவசாயிக்கு அனுப்பப்பட்டது",
        "admin.noExpiredAdmin": "அமைப்பில் காலாவதியான உணவு எதுவும் இல்லை",
        "admin.noExpiredAdminSub": "அனைத்து சரக்குகளும் புத்துணர்ச்சியுடன் உள்ளன அல்லது ஏற்கனவே மறுவிநியோகம் செய்யப்பட்டுள்ளன.",
        "admin.receiverReqTitle": "பெறுநர் உணவு கோரிக்கைகள் மேலாண்மை",
        "admin.receiverReqSubtitle": "காப்பகங்கள், தன்னார்வ தொண்டு நிறுவனங்கள் மற்றும் தொண்டு நிறுவனங்களுக்கு உணவை மதிப்பாய்வு செய்து ஒதுக்குங்கள்.",
        "admin.noReceiverReq": "பெறுநர் உணவு கோரிக்கைகள் எதுவும் இல்லை",
        "admin.noReceiverReqSub": "தொண்டு நிறுவனங்கள் உணவைக் கோரும்போது, அவை பரிசீலனைக்காக இங்கே தோன்றும்.",
        "admin.farmerReqTitle": "விவசாயி காலாவதியான உணவு கோரிக்கைகள் மேலாண்மை",
        "admin.farmerReqSubtitle": "உரம் தயாரிப்பிற்காக பதிவுசெய்த விவசாயிகளுக்கு காலாவதியான உணவை மதிப்பாய்வு செய்து ஒதுக்குங்கள்.",
        "admin.noFarmerReq": "விவசாயக் கோரிக்கைகள் எதுவும் இல்லை",
        "admin.noFarmerReqSub": "விவசாயிகள் உரம் தயாரிக்க கோரிக்கை விடுக்கும்போது, அவை ஒப்புதலுக்காக இங்கே தோன்றும்.",
        "admin.donorsTitle": "பதிவுசெய்த நன்கொடையாளர்கள்",
        "admin.receiversTitle": "பதிவுசெய்த பெறுநர்கள்",
        "admin.farmersTitle": "பதிவுசெய்த விவசாயிகள்",
        "admin.allHistoryTitle": "அமைப்பின் உணவு வாழ்க்கை சுழற்சி தணிக்கைப் பதிவு",
        "admin.allHistorySubtitle": "அனைத்து நிலை மாற்றங்கள், கோரிக்கைகள், ஒதுக்கீடுகள் ஆகியவற்றின் முழுமையான மாறாத வரலாறு.",
        "admin.noHistory": "வரலாற்றுப் பதிவுகள் எதுவும் இல்லை",
        "admin.reportsTitle": "அமைப்பின் தாக்க அறிக்கைகள் & பகுப்பாய்வு",
        "admin.monthlyReport": "மாதாந்திர உணவு வீணடிப்பு குறைப்பு & மீட்பு அறிக்கை",
        "admin.exportCsv": "அறிக்கையை ஏற்றுமதி செய் (CSV)",
        "admin.totalDonated": "மொத்த நன்கொடை",
        "admin.totalDistributed": "மொத்த விநியோகம்",
        "admin.sentToFarmers": "விவசாயிகளுக்கு அனுப்பப்பட்டது",
        "admin.wasteReduction": "வீணடிப்பு குறைப்பு %",
        "admin.foodSavedFromLandfill": "{0} கிலோ உணவு குப்பைக் கிடங்கிலிருந்து காப்பாற்றப்பட்டது",

        // Admin Modals & Action Dialogs
        "modal.allocateReceiverTitle": "பெறுநருக்கு உணவை ஒதுக்குங்கள்",
        "modal.foodAndReceiver": "உணவுப் பொருள் & பெறுநர்",
        "modal.scheduledPickupDate": "திட்டமிடப்பட்ட எடுக்கும் தேதி & நேரம்",
        "modal.confirmAllocation": "ஒதுக்கீட்டை உறுதிப்படுத்து",
        "modal.sendToFarmerTitle": "காலாவதியான உணவை விவசாயிக்கு அனுப்பு",
        "modal.selectFarmer": "விவசாயியைத் தேர்ந்தெடுக்கவும்",
        "modal.loadingFarmers": "விவசாயிகள் விவரம் ஏற்றப்படுகிறது...",
        "modal.recyclingNotes": "குறிப்புகள் / மறுசுழற்சி வழிகாட்டுதல்கள்",
        "modal.recyclingNotesPlaceholder": "எ.கா. மண்புழு உரத்திற்கு",
        "modal.assignToFarmer": "விவசாயிக்கு ஒதுக்கு",
        "modal.auditTrailTitle": "உணவு வாழ்க்கை சுழற்சி தணிக்கைப் பதிவு",
        "modal.foodItemHistory": "உணவுப் பொருள்:",
        "modal.code": "குறியீடு:",
        "modal.currentStatus": "தற்போதைய நிலை:",
        "modal.noHistoryFood": "இந்த உணவுப் பொருளுக்கு வரலாற்று நிகழ்வுகள் எதுவும் இல்லை.",

        // Table Columns & Common Labels
        "th.code": "குறியீடு",
        "th.foodName": "உணவுப் பெயர்",
        "th.category": "வகை",
        "th.quantity": "அளவு",
        "th.remaining": "மீதமுள்ள அளவு",
        "th.expiryDate": "காலாவதி தேதி",
        "th.status": "நிலை",
        "th.actions": "நடவடிக்கைகள்",
        "th.donor": "நன்கொடையாளர்",
        "th.receiver": "பெறுநர்",
        "th.requestedQty": "கோரப்பட்ட அளவு",
        "th.requestedDate": "கோரிய தேதி",
        "th.farmer": "விவசாயி",
        "th.intendedUse": "பயன்பாடு",
        "th.action": "செயல்",
        "th.prevStatus": "முந்தைய நிலை",
        "th.newStatus": "புதிய நிலை",
        "th.performedBy": "செய்தவர்",
        "th.timestamp": "நேரமுத்திரை",
        "th.remarks": "குறிப்புகள்",
        "th.org": "நிறுவனம்",
        "th.fullName": "முழுப் பெயர்",
        "th.email": "மின்னஞ்சல்",
        "th.phone": "தொலைபேசி",
        "th.address": "முகவரி",
        "th.institution": "நிறுவனம் / காப்பகம்",
        "th.reqFood": "தேவைப்படும் உணவு",
        "th.farmName": "பண்ணை பெயர்",
        "th.location": "இடம்",
        "th.capacity": "திறன்",

        // Table Action Buttons
        "btn.viewHistory": "வரலாற்றைப் பார்",
        "btn.approve": "அங்கீகரி",
        "btn.allocate": "ஒதுக்கு",
        "btn.readyForPickup": "எடுக்க தயார்",
        "btn.reject": "நிராகரி",
        "btn.redirectFarmer": "விவசாயிக்கு மாற்று",
        "btn.confirm": "உறுதிப்படுத்து",
        "btn.cancel": "ரத்து செய்",
        "btn.save": "சேமி",
        "btn.close": "மூடு",

        // Food Categories
        "category.COOKED_FOOD": "சமைத்த உணவு",
        "category.FRUITS": "பழங்கள்",
        "category.VEGETABLES": "காய்கறிகள்",
        "category.RICE": "சாதம் / அரிசி",
        "category.GRAINS": "தானியங்கள்",
        "category.BAKERY": "பேக்கரி உணவுகள்",
        "category.DAIRY": "பால் பொருட்கள்",
        "category.PACKAGED_FOOD": "பாக்கெட் உணவுகள்",
        "category.OTHER": "மற்றவை",

        // Status Badges
        "status.AVAILABLE": "கிடைக்கிறது",
        "status.REQUESTED": "கோரப்பட்டது",
        "status.APPROVED": "அங்கீகரிக்கப்பட்டது",
        "status.ALLOCATED": "ஒதுக்கப்பட்டது",
        "status.READY_FOR_PICKUP": "எடுக்க தயார்",
        "status.PICKED_UP": "எடுக்கப்பட்டது",
        "status.DISTRIBUTED": "விநியோகிக்கப்பட்டது",
        "status.EXPIRED": "காலாவதியானது",
        "status.SENT_TO_FARMER": "விவசாயிக்கு அனுப்பப்பட்டது",
        "status.COMPLETED": "முடிந்தது",
        "status.REMOVED": "நீக்கப்பட்டது",
        "status.REJECTED": "நிராகரிக்கப்பட்டது",
        "status.PENDING": "நிலுவையில்",
        "status.ACCEPTED": "ஏற்றுக்கொள்ளப்பட்டது",
        "status.ASSIGNED": "ஒதுக்கப்பட்டது",
        "status.COLLECTED": "சேகரிக்கப்பட்டது",

        // Toasts & Alerts
        "toast.welcome": "மீண்டும் நல்வரவு, {0}",
        "toast.loginFailed": "உள்நுழைவு தோல்வியடைந்தது. விவரங்களைச் சரிபார்க்கவும்.",
        "toast.registerSuccess": "கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
        "toast.registerFailed": "பதிவு தோல்வியடைந்தது: {0}",
        "toast.foodAdded": "உணவு நன்கொடை வெற்றிகரமாக பதிவு செய்யப்பட்டது (நிலை: கிடைக்கிறது)!",
        "toast.foodAddError": "உணவைச் சேர்ப்பதில் பிழை: {0}",
        "toast.foodRemoved": "உணவு நன்கொடை வெற்றிகரமாக நீக்கப்பட்டது.",
        "toast.foodRemoveError": "உணவை நீக்குவதில் பிழை: {0}",
        "toast.farmerReqSubmitted": "மறுசுழற்சி ஒப்புதலுக்காக நிர்வாகியிடம் கோரிக்கை சமர்ப்பிக்கப்பட்டது.",
        "toast.farmerReqError": "கோரிக்கையை சமர்ப்பிக்க முடியவில்லை: {0}",
        "toast.farmerApproved": "விவசாயக் கோரிக்கை அங்கீகரிக்கப்பட்டு ஒதுக்கப்பட்டது.",
        "toast.farmerRejected": "விவசாயக் கோரிக்கை நிராகரிக்கப்பட்டது.",
        "toast.farmerCollected": "உணவு விவசாயியால் சேகரிக்கப்பட்டதாகக் குறிக்கப்பட்டது.",
        "toast.farmerCompleted": "உரமாக்கல் / உயிரி மறுசுழற்சி நிறைவடைந்ததாகக் குறிக்கப்பட்டது!",
        "toast.requestSubmitted": "உணவு கோரிக்கை சமர்ப்பிக்கப்பட்டது! நிர்வாகி ஒப்புதலுக்கு காத்திருக்கிறது.",
        "toast.requestError": "உணவு கோரிக்கையை சமர்ப்பிக்க முடியவில்லை: {0}",
        "toast.requestApproved": "கோரிக்கை வெற்றிகரமாக அங்கீகரிக்கப்பட்டது.",
        "toast.requestAllocated": "உணவு வெற்றிகரமாக பெறுநருக்கு ஒதுக்கப்பட்டது!",
        "toast.readyForPickup": "உணவு எடுக்க தயாராக இருப்பதாக பெறுநருக்கு அறிவிக்கப்பட்டது!",
        "toast.requestRejected": "கோரிக்கை நிராகரிக்கப்பட்டது.",
        "toast.pickedUp": "உணவு எடுத்துச் செல்லப்பட்டதாகக் குறிக்கப்பட்டது!",
        "toast.completed": "உணவு தேவைப்படுபவர்களுக்கு விநியோகிக்கப்பட்டு முடிவடைந்தது!",
        "toast.sentToFarmerSuccess": "காலாவதியான உணவு உரம் தயாரிப்பிற்காக விவசாயிக்கு வெற்றிகரமாக ஒதுக்கப்பட்டது!",
        "toast.allNotifRead": "அனைத்து அறிவிப்புகளும் படித்ததாகக் குறிக்கப்பட்டது",
        "toast.notifReadFail": "அனைத்தையும் படித்ததாகக் குறிக்க முடியவில்லை",
        "toast.sessionExpired": "அமர்வு காலாவதியானது. தயவுசெய்து மீண்டும் உள்நுழைக.",
        "toast.enterValidQty": "தயவுசெய்து 1 மற்றும் {0} {1} இடையே சரியான அளவை உள்ளிடவும்",
        "toast.enterReason": "தயவுசெய்து ஒரு காரணத்தைத் தேர்ந்தெடுக்கவும்.",
        "toast.fillAllFields": "தேவையான அனைத்து புலங்களையும் நிரப்பவும்.",
        "toast.rejectConfirm": "இந்தக் கோரிக்கையை நிச்சயமாக நிராகரிக்க விரும்புகிறீர்களா?"
    }
};

// Current active language
let currentLang = localStorage.getItem('foodrescue_lang') || 'en';

// Translate function with optional format parameters
function t(key, params = []) {
    const langDict = translations[currentLang] || translations['en'];
    let text = langDict[key] || translations['en'][key] || key;

    if (Array.isArray(params)) {
        params.forEach((val, idx) => {
            text = text.replace(new RegExp(`\\{${idx}\\}`, 'g'), val);
        });
    } else if (params !== undefined && params !== null) {
        text = text.replace(/\{0\}/g, params);
    }
    return text;
}

// Get current language code
function getCurrentLanguage() {
    return currentLang;
}

// Change language handler
function changeLanguage(lang) {
    if (lang !== 'en' && lang !== 'ta') return;
    currentLang = lang;
    localStorage.setItem('foodrescue_lang', lang);
    document.documentElement.lang = lang;

    // Update Language Dropdown Text in Navbar & Auth Screen
    const langText = lang === 'ta' ? 'தமிழ்' : 'English';
    const langBtnElements = document.querySelectorAll('.current-lang-text');
    langBtnElements.forEach(el => {
        el.textContent = langText;
    });

    // Translate static elements with data-i18n
    applyStaticTranslations();

    // Re-render UI components if app is active
    if (typeof refreshCurrentView === 'function') {
        refreshCurrentView();
    }
}

// Apply translations to DOM elements with data-i18n attributes
function applyStaticTranslations() {
    // Inner text translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = t(key);
        }
    });

    // Inner HTML translations
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (key) {
            el.innerHTML = t(key);
        }
    });

    // Placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
            el.setAttribute('placeholder', t(key));
        }
    });

    // Title attribute translations
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
            el.setAttribute('title', t(key));
        }
    });
}
