// Global state
let currentUser = null;
let userNFTs = [];
let currentQuestion = 0;
let testAnswers = [];
let verificationProgress = {
    aiTest: false,
    peerReview: false,
    certificate: false
};

// Sample questions for different skills
const skillQuestions = {
    tech: [
        {
            question: "What is the primary purpose of version control in software development?",
            options: ["To compile code faster", "To track changes and collaborate on code", "To debug applications"],
            correct: 1
        },
        {
            question: "Which of the following is NOT a programming paradigm?",
            options: ["Object-Oriented", "Functional", "Database"],
            correct: 2
        },
        {
            question: "What does API stand for?",
            options: ["Application Programming Interface", "Advanced Programming Integration", "Automated Program Instruction"],
            correct: 0
        }
    ],
    medical: [
        {
            question: "What is the normal resting heart rate for adults?",
            options: ["40-60 bpm", "60-100 bpm", "100-120 bpm"],
            correct: 1
        },
        {
            question: "Which organ produces insulin?",
            options: ["Liver", "Pancreas", "Kidney"],
            correct: 1
        }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadUserData();
    updateNFTGallery();
    loadProjects();
    updateProgressDashboard();
    updateAIRecommendations();
    showPage('homePage');
});

// Page Navigation Function
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'nftPage') {
        updateNFTGallery();
    } else if (pageId === 'employersPage') {
        loadProjects();
    }
}

function initializeEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', function() { showModal('loginModal'); });
    document.getElementById('registerBtn').addEventListener('click', function() { showModal('registerModal'); });
    document.getElementById('closeLogin').addEventListener('click', function() { hideModal('loginModal'); });
    document.getElementById('closeRegister').addEventListener('click', function() { hideModal('registerModal'); });
    document.getElementById('closeTest').addEventListener('click', function() { hideModal('testModal'); });
    document.getElementById('closeSuccess').addEventListener('click', function() { hideModal('successModal'); });

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    document.getElementById('getStartedBtn').addEventListener('click', function() { showModal('registerModal'); });
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('connectMetaMask').addEventListener('click', connectMetaMask);
    document.getElementById('connectWalletConnect').addEventListener('click', connectWalletConnect);
    document.getElementById('mintNFTBtn').addEventListener('click', mintNFT);
    document.getElementById('verifyCandidate').addEventListener('click', verifyCandidate);
    document.getElementById('postProject').addEventListener('click', postProject);

    document.querySelectorAll('.peer-review').forEach(function(btn) {
        btn.addEventListener('click', startPeerReview);
    });

    document.querySelectorAll('.upload-cert').forEach(function(btn) {
        btn.addEventListener('click', uploadCertificate);
    });

    document.querySelectorAll('.start-test').forEach(function(btn) {
        btn.addEventListener('click', startAITest);
    });

    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
    document.getElementById('prevQuestion').addEventListener('click', prevQuestion);

    if (document.getElementById('startAITestBtn')) {
        document.getElementById('startAITestBtn').addEventListener('click', startAITestPath);
    }
    if (document.getElementById('uploadCertificateBtn')) {
        document.getElementById('uploadCertificateBtn').addEventListener('click', startCertificatePath);
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;

    currentUser = {
        email: email,
        name: "Onkar Garde",
        wallet: "0x1234...5678",
        skills: ["JavaScript", "React", "Node.js"],
        nfts: []
    };

    localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    hideModal('loginModal');
    updateUIForLoggedInUser();
    showSuccess("Welcome back! You're now logged in.");
}

function handleRegister(e) {
    e.preventDefault();
    var name = document.getElementById('registerName').value;
    var email = document.getElementById('registerEmail').value;
    var education = document.getElementById('registerEducation').value;
    var skills = document.getElementById('registerSkills').value.split(',').map(function(s) { return s.trim(); });

    currentUser = {
        name: name,
        email: email,
        education: education,
        skills: skills,
        wallet: null,
        nfts: [],
        verificationProgress: {
            aiTest: false,
            peerReview: false,
            certificate: false
        }
    };

    localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    hideModal('registerModal');
    updateUIForLoggedInUser();
    showSuccess("Registration successful! Complete your profile and start skill verification.");
}

function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        showSuccess("MetaMask wallet connected successfully!");
    } else {
        if (currentUser) {
            currentUser.wallet = "0x" + Math.random().toString(16).substr(2, 8) + "...";
            localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
            showSuccess("Demo wallet connected: " + currentUser.wallet);
        }
    }
    hideModal('loginModal');
}

function connectMetaMask() {
    var walletAddress = "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4);

    document.getElementById('walletStatus').className = 'w-3 h-3 bg-green-500 rounded-full';
    document.getElementById('walletText').textContent = 'Connected: ' + walletAddress;

    if (userSkillProgress.completed.length > 0) {
        document.getElementById('mintNFTBtn').disabled = false;
    }

    if (currentUser) {
        currentUser.wallet = walletAddress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    showSuccess("MetaMask wallet connected successfully!");
}

function connectWalletConnect() {
    var walletAddress = "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4);

    document.getElementById('walletStatus').className = 'w-3 h-3 bg-blue-500 rounded-full';
    document.getElementById('walletText').textContent = 'Connected: ' + walletAddress;

    if (userSkillProgress.completed.length > 0) {
        document.getElementById('mintNFTBtn').disabled = false;
    }

    if (currentUser) {
        currentUser.wallet = walletAddress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    showSuccess("WalletConnect connected successfully!");
}

// Global variables for skill system
var selectedSkillCategory = null;
var selectedSpecificSkill = null;
var selectedVerificationPath = null;
var userSkillProgress = {
    inProgress: [],
    completed: [],
    scores: {}
};
var mentorReviewStatus = {
    aiTestPath: {},
    certificatePath: {}
};

// Complete skill database
var skillDatabase = {
    tech: {
        name: "Tech Skills",
        icon: "\uD83D\uDCBB",
        color: "blue",
        description: "Programming, Web Dev, AI/ML, Blockchain",
        skills: [
            { name: "JavaScript Programming", difficulty: "Intermediate", duration: "15 mins", demand: "Very High", topics: ["ES6+ Features", "DOM Manipulation", "Async Programming", "Error Handling", "Testing"], category: "Programming" },
            { name: "Python Programming", difficulty: "Beginner", duration: "12 mins", demand: "Very High", topics: ["Syntax & Variables", "Data Structures", "Functions", "OOP Concepts", "Libraries"], category: "Programming" },
            { name: "Java Development", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["OOP Principles", "Spring Framework", "JVM", "Multithreading", "Database Integration"], category: "Programming" },
            { name: "C++ Programming", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Memory Management", "STL", "Templates", "Algorithms", "System Programming"], category: "Programming" },
            { name: "Solidity Development", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Smart Contracts", "Gas Optimization", "Security", "DeFi Protocols", "Testing"], category: "Programming" },
            { name: "Frontend Development", difficulty: "Intermediate", duration: "16 mins", demand: "Very High", topics: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Performance"], category: "Web Development" },
            { name: "Backend Development", difficulty: "Intermediate", duration: "18 mins", demand: "Very High", topics: ["APIs", "Databases", "Authentication", "Security", "Deployment"], category: "Web Development" },
            { name: "Full Stack Development", difficulty: "Advanced", duration: "25 mins", demand: "Very High", topics: ["Frontend + Backend", "DevOps", "Architecture", "Testing", "Scaling"], category: "Web Development" },
            { name: "React Framework", difficulty: "Advanced", duration: "20 mins", demand: "Very High", topics: ["Components", "State Management", "Hooks", "Context API", "Performance"], category: "Web Development" },
            { name: "Node.js Backend", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Express.js", "APIs", "Database Integration", "Authentication", "Deployment"], category: "Web Development" },
            { name: "Machine Learning", difficulty: "Advanced", duration: "25 mins", demand: "Very High", topics: ["Algorithms", "Data Processing", "Model Training", "Evaluation", "Deployment"], category: "AI/ML" },
            { name: "Data Science", difficulty: "Intermediate", duration: "20 mins", demand: "Very High", topics: ["Statistics", "Data Analysis", "Visualization", "Pandas", "NumPy"], category: "AI/ML" },
            { name: "Deep Learning", difficulty: "Advanced", duration: "28 mins", demand: "Very High", topics: ["Neural Networks", "TensorFlow", "PyTorch", "Computer Vision", "NLP"], category: "AI/ML" },
            { name: "AI Ethics", difficulty: "Intermediate", duration: "15 mins", demand: "High", topics: ["Bias Detection", "Fairness", "Privacy", "Transparency", "Governance"], category: "AI/ML" },
            { name: "Blockchain Development", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Smart Contracts", "Solidity", "Web3", "DeFi", "NFTs"], category: "Blockchain" },
            { name: "Cryptocurrency Trading", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Technical Analysis", "DeFi", "Risk Management", "Portfolio", "Regulations"], category: "Blockchain" },
            { name: "Web3 Development", difficulty: "Advanced", duration: "24 mins", demand: "High", topics: ["dApps", "MetaMask", "IPFS", "Oracles", "Layer 2"], category: "Blockchain" }
        ]
    },
    nontech: {
        name: "Non-Tech Skills",
        icon: "\uD83E\uDD1D",
        color: "green",
        description: "Communication, Leadership, Management",
        skills: [
            { name: "Public Speaking", difficulty: "Intermediate", duration: "12 mins", demand: "Very High", topics: ["Presentation Skills", "Audience Engagement", "Voice Control", "Body Language", "Confidence"], category: "Communication" },
            { name: "Written Communication", difficulty: "Beginner", duration: "10 mins", demand: "Very High", topics: ["Business Writing", "Email Etiquette", "Reports", "Proposals", "Clarity"], category: "Communication" },
            { name: "Interpersonal Skills", difficulty: "Beginner", duration: "10 mins", demand: "High", topics: ["Active Listening", "Empathy", "Conflict Resolution", "Networking", "Collaboration"], category: "Communication" },
            { name: "Cross-Cultural Communication", difficulty: "Intermediate", duration: "14 mins", demand: "High", topics: ["Cultural Awareness", "Global Teams", "Language Barriers", "Sensitivity", "Adaptation"], category: "Communication" },
            { name: "Team Leadership", difficulty: "Intermediate", duration: "15 mins", demand: "Very High", topics: ["Team Building", "Motivation", "Delegation", "Performance Management", "Vision Setting"], category: "Leadership" },
            { name: "Strategic Leadership", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Strategic Planning", "Change Management", "Innovation", "Decision Making", "Organizational Culture"], category: "Leadership" },
            { name: "Emotional Intelligence", difficulty: "Intermediate", duration: "12 mins", demand: "High", topics: ["Self-Awareness", "Empathy", "Social Skills", "Self-Regulation", "Motivation"], category: "Leadership" },
            { name: "Mentoring & Coaching", difficulty: "Intermediate", duration: "14 mins", demand: "High", topics: ["Coaching Techniques", "Feedback", "Development Planning", "Goal Setting", "Support"], category: "Leadership" },
            { name: "Project Management", difficulty: "Intermediate", duration: "18 mins", demand: "Very High", topics: ["Planning", "Resource Management", "Risk Assessment", "Agile/Scrum", "Delivery"], category: "Management" },
            { name: "Time Management", difficulty: "Beginner", duration: "10 mins", demand: "High", topics: ["Prioritization", "Scheduling", "Productivity", "Goal Setting", "Work-Life Balance"], category: "Management" },
            { name: "Change Management", difficulty: "Advanced", duration: "18 mins", demand: "High", topics: ["Change Strategy", "Stakeholder Management", "Communication", "Training", "Resistance Management"], category: "Management" },
            { name: "Problem Solving", difficulty: "Intermediate", duration: "12 mins", demand: "Very High", topics: ["Critical Thinking", "Analysis", "Creative Solutions", "Decision Making", "Implementation"], category: "Management" }
        ]
    },
    creative: {
        name: "Design / Creative",
        icon: "\uD83C\uDFA8",
        color: "purple",
        description: "UI-UX, Graphic Design, Animation",
        skills: [
            { name: "UI Design", difficulty: "Intermediate", duration: "18 mins", demand: "Very High", topics: ["Visual Design", "Typography", "Color Theory", "Layout", "Design Systems"], category: "UI-UX" },
            { name: "UX Research", difficulty: "Intermediate", duration: "20 mins", demand: "Very High", topics: ["User Research", "Personas", "Journey Mapping", "Usability Testing", "Analytics"], category: "UI-UX" },
            { name: "Interaction Design", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Prototyping", "Micro-interactions", "Animation", "User Flow", "Accessibility"], category: "UI-UX" },
            { name: "Design Systems", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Component Libraries", "Style Guides", "Consistency", "Scalability", "Documentation"], category: "UI-UX" },
            { name: "Brand Design", difficulty: "Intermediate", duration: "16 mins", demand: "High", topics: ["Logo Design", "Brand Identity", "Visual Language", "Guidelines", "Applications"], category: "Graphic Design" },
            { name: "Print Design", difficulty: "Beginner", duration: "14 mins", demand: "Medium", topics: ["Layout", "Typography", "Color Management", "Print Production", "File Formats"], category: "Graphic Design" },
            { name: "Digital Illustration", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Vector Graphics", "Digital Painting", "Character Design", "Concept Art", "Tools"], category: "Graphic Design" },
            { name: "Adobe Creative Suite", difficulty: "Intermediate", duration: "16 mins", demand: "High", topics: ["Photoshop", "Illustrator", "InDesign", "After Effects", "Workflow"], category: "Graphic Design" },
            { name: "Motion Graphics", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Animation Principles", "After Effects", "Cinema 4D", "Compositing", "Rendering"], category: "Animation" },
            { name: "2D Animation", difficulty: "Intermediate", duration: "20 mins", demand: "Medium", topics: ["Frame-by-Frame", "Tweening", "Character Animation", "Storyboarding", "Timing"], category: "Animation" },
            { name: "3D Animation", difficulty: "Advanced", duration: "25 mins", demand: "High", topics: ["3D Modeling", "Rigging", "Lighting", "Texturing", "Rendering"], category: "Animation" },
            { name: "Video Editing", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Cutting & Trimming", "Effects", "Audio Sync", "Color Grading", "Export Formats"], category: "Animation" }
        ]
    },
    business: {
        name: "Corporate / Business",
        icon: "\uD83C\uDFE2",
        color: "orange",
        description: "Marketing, Finance, HR",
        skills: [
            { name: "Digital Marketing", difficulty: "Intermediate", duration: "15 mins", demand: "Very High", topics: ["SEO/SEM", "Social Media", "Content Strategy", "Analytics", "Campaign Management"], category: "Marketing" },
            { name: "Content Marketing", difficulty: "Intermediate", duration: "14 mins", demand: "High", topics: ["Content Strategy", "Storytelling", "SEO Writing", "Distribution", "Measurement"], category: "Marketing" },
            { name: "Social Media Marketing", difficulty: "Beginner", duration: "12 mins", demand: "High", topics: ["Platform Strategy", "Content Creation", "Community Management", "Advertising", "Analytics"], category: "Marketing" },
            { name: "Email Marketing", difficulty: "Beginner", duration: "10 mins", demand: "High", topics: ["Campaign Design", "Segmentation", "Automation", "A/B Testing", "Deliverability"], category: "Marketing" },
            { name: "Brand Marketing", difficulty: "Advanced", duration: "18 mins", demand: "High", topics: ["Brand Strategy", "Positioning", "Messaging", "Campaign Development", "Brand Management"], category: "Marketing" },
            { name: "Financial Analysis", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Financial Statements", "Ratio Analysis", "Valuation", "Risk Assessment", "Forecasting"], category: "Finance" },
            { name: "Investment Analysis", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Portfolio Management", "Asset Allocation", "Risk Management", "Market Analysis", "Trading"], category: "Finance" },
            { name: "Corporate Finance", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Capital Structure", "Budgeting", "Cash Flow", "Mergers & Acquisitions", "Valuation"], category: "Finance" },
            { name: "Personal Finance", difficulty: "Beginner", duration: "12 mins", demand: "High", topics: ["Budgeting", "Saving", "Investing", "Insurance", "Retirement Planning"], category: "Finance" },
            { name: "Talent Acquisition", difficulty: "Intermediate", duration: "16 mins", demand: "High", topics: ["Recruitment Strategy", "Interviewing", "Candidate Assessment", "Employer Branding", "Onboarding"], category: "HR" },
            { name: "Performance Management", difficulty: "Intermediate", duration: "14 mins", demand: "High", topics: ["Goal Setting", "Feedback", "Reviews", "Development Planning", "Recognition"], category: "HR" },
            { name: "Employee Relations", difficulty: "Intermediate", duration: "15 mins", demand: "High", topics: ["Conflict Resolution", "Communication", "Policy Development", "Compliance", "Culture"], category: "HR" }
        ]
    },
    medical: {
        name: "Medical / Healthcare",
        icon: "\uD83C\uDFE5",
        color: "red",
        description: "Nursing, Diagnostics, Psychology",
        skills: [
            { name: "Patient Care", difficulty: "Intermediate", duration: "20 mins", demand: "High", topics: ["Vital Signs", "Medical History", "Physical Assessment", "Care Planning", "Documentation"], category: "Nursing" },
            { name: "Clinical Procedures", difficulty: "Advanced", duration: "25 mins", demand: "High", topics: ["Sterile Technique", "Medication Administration", "Wound Care", "IV Therapy", "Emergency Response"], category: "Nursing" },
            { name: "Pediatric Nursing", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Child Development", "Family-Centered Care", "Pediatric Procedures", "Communication", "Safety"], category: "Nursing" },
            { name: "Critical Care Nursing", difficulty: "Advanced", duration: "28 mins", demand: "High", topics: ["Advanced Monitoring", "Life Support", "Emergency Protocols", "Pharmacology", "Family Support"], category: "Nursing" },
            { name: "Medical Imaging", difficulty: "Advanced", duration: "24 mins", demand: "High", topics: ["X-Ray", "CT Scan", "MRI", "Ultrasound", "Image Interpretation"], category: "Diagnostics" },
            { name: "Laboratory Testing", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Blood Analysis", "Microbiology", "Chemistry", "Quality Control", "Safety Protocols"], category: "Diagnostics" },
            { name: "Pathology", difficulty: "Advanced", duration: "26 mins", demand: "High", topics: ["Tissue Analysis", "Disease Identification", "Microscopy", "Reporting", "Research"], category: "Diagnostics" },
            { name: "Clinical Psychology", difficulty: "Advanced", duration: "25 mins", demand: "High", topics: ["Assessment", "Therapy Techniques", "Mental Health", "Treatment Planning", "Ethics"], category: "Psychology" },
            { name: "Counseling Skills", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Active Listening", "Empathy", "Communication", "Crisis Intervention", "Boundaries"], category: "Psychology" },
            { name: "Behavioral Analysis", difficulty: "Advanced", duration: "22 mins", demand: "High", topics: ["Behavior Modification", "Assessment Tools", "Data Collection", "Intervention Design", "Evaluation"], category: "Psychology" },
            { name: "Health Psychology", difficulty: "Intermediate", duration: "20 mins", demand: "High", topics: ["Health Behavior", "Stress Management", "Chronic Illness", "Prevention", "Wellness"], category: "Psychology" }
        ]
    },
    hobbies: {
        name: "Hobbies",
        icon: "\uD83C\uDFAD",
        color: "pink",
        description: "Music, Photography, Content Creation",
        skills: [
            { name: "Music Production", difficulty: "Intermediate", duration: "18 mins", demand: "Medium", topics: ["DAW Software", "Recording", "Mixing", "Mastering", "Sound Design"], category: "Music" },
            { name: "Music Theory", difficulty: "Beginner", duration: "14 mins", demand: "Medium", topics: ["Scales", "Chords", "Harmony", "Rhythm", "Composition"], category: "Music" },
            { name: "Audio Engineering", difficulty: "Advanced", duration: "22 mins", demand: "Medium", topics: ["Acoustics", "Signal Processing", "Studio Setup", "Live Sound", "Post-Production"], category: "Music" },
            { name: "DJ Skills", difficulty: "Intermediate", duration: "16 mins", demand: "Medium", topics: ["Beatmatching", "Mixing", "Equipment", "Music Selection", "Performance"], category: "Music" },
            { name: "Digital Photography", difficulty: "Beginner", duration: "12 mins", demand: "Medium", topics: ["Camera Settings", "Composition", "Lighting", "Post-Processing", "Portfolio Building"], category: "Photography" },
            { name: "Portrait Photography", difficulty: "Intermediate", duration: "16 mins", demand: "Medium", topics: ["Lighting Setup", "Posing", "Background", "Retouching", "Client Management"], category: "Photography" },
            { name: "Wedding Photography", difficulty: "Advanced", duration: "20 mins", demand: "High", topics: ["Event Planning", "Candid Shots", "Equipment", "Client Relations", "Business"], category: "Photography" },
            { name: "Photo Editing", difficulty: "Intermediate", duration: "14 mins", demand: "High", topics: ["Lightroom", "Photoshop", "Color Correction", "Retouching", "Workflow"], category: "Photography" },
            { name: "YouTube Content", difficulty: "Intermediate", duration: "16 mins", demand: "High", topics: ["Video Planning", "Filming", "Editing", "Thumbnails", "Analytics"], category: "Content Creation" },
            { name: "Social Media Content", difficulty: "Beginner", duration: "12 mins", demand: "Very High", topics: ["Content Strategy", "Visual Design", "Copywriting", "Scheduling", "Engagement"], category: "Content Creation" },
            { name: "Podcast Production", difficulty: "Intermediate", duration: "18 mins", demand: "High", topics: ["Audio Recording", "Editing", "Show Format", "Distribution", "Monetization"], category: "Content Creation" },
            { name: "Creative Writing", difficulty: "Beginner", duration: "15 mins", demand: "Medium", topics: ["Storytelling", "Character Development", "Plot Structure", "Editing", "Publishing"], category: "Content Creation" },
            { name: "Blogging", difficulty: "Beginner", duration: "12 mins", demand: "High", topics: ["Content Planning", "SEO Writing", "WordPress", "Monetization", "Audience Building"], category: "Content Creation" }
        ]
    }
};

function selectSkillCategory(categoryKey) {
    selectedSkillCategory = categoryKey;
    var category = skillDatabase[categoryKey];

    document.querySelectorAll('.skill-category').forEach(function(cat) {
        cat.classList.remove('ring-4');
    });

    var categorySkills = document.getElementById('categorySkills');
    var categoryName = document.getElementById('selectedCategoryName');
    var skillsList = document.getElementById('skillsList');

    categoryName.textContent = category.name;

    skillsList.innerHTML = category.skills.map(function(skill) {
        return '<div class="skill-item bg-gray-50 p-4 rounded-lg hover:bg-' + category.color + '-50 cursor-pointer border-2 border-transparent hover:border-' + category.color + '-300 transition-all" onclick="selectIndividualSkill(\'' + categoryKey + '\', \'' + skill.name.replace(/'/g, "\\'") + '\')">' +
            '<h5 class="font-semibold mb-2">' + skill.name + '</h5>' +
            '<div class="flex flex-wrap gap-2 mb-3">' +
                '<span class="bg-' + category.color + '-100 text-' + category.color + '-800 px-2 py-1 rounded-full text-xs">' + skill.difficulty + '</span>' +
                '<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">' + skill.duration + '</span>' +
                '<span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">' + skill.demand + ' Demand</span>' +
            '</div>' +
            '<p class="text-sm text-gray-600">' + skill.topics.slice(0, 3).join(', ') + '...</p>' +
            '<button class="w-full mt-3 bg-' + category.color + '-500 text-white py-2 rounded-lg text-sm hover:bg-' + category.color + '-600 transition-colors">Select This Skill</button>' +
        '</div>';
    }).join('');

    categorySkills.classList.remove('hidden');
    categorySkills.scrollIntoView({ behavior: 'smooth' });
}

function hideCategorySkills() {
    document.getElementById('categorySkills').classList.add('hidden');
}

function selectIndividualSkill(categoryKey, skillName) {
    selectedSpecificSkill = skillName;
    var category = skillDatabase[categoryKey];
    var skill = category.skills.find(function(s) { return s.name === skillName; });

    hideCategorySkills();

    var skillDetails = document.getElementById('skillDetails');
    document.getElementById('selectedSkillName').textContent = skillName;
    document.getElementById('skillDifficulty').textContent = skill.difficulty;
    document.getElementById('skillDuration').textContent = skill.duration + ' test';
    document.getElementById('skillDemand').textContent = skill.demand + ' Demand';
    document.getElementById('testTime').textContent = skill.duration;

    var questionCount = skill.difficulty === 'Beginner' ? 15 : skill.difficulty === 'Intermediate' ? 20 : 25;
    document.getElementById('testFormat').textContent = questionCount + ' Multiple Choice Questions';

    document.getElementById('testTopics').innerHTML = skill.topics.map(function(topic) {
        return '<li class="flex items-center"><span class="w-2 h-2 bg-' + category.color + '-500 rounded-full mr-3"></span>' + topic + '</li>';
    }).join('');

    var demandPercentage = skill.demand === 'Very High' ? 95 : skill.demand === 'High' ? 85 : 70;
    document.getElementById('aiRecommendations').textContent = 'Based on market trends, this skill has ' + demandPercentage + '% job growth potential and is highly sought after by employers.';

    skillDetails.classList.remove('hidden');
    skillDetails.scrollIntoView({ behavior: 'smooth' });

    updateSkillActionButtons(categoryKey, skillName);
}

function hideSkillDetails() {
    document.getElementById('skillDetails').classList.add('hidden');
}

function updateSkillActionButtons(categoryKey, skillName) {
    document.getElementById('startTestBtn').onclick = function() { startSkillTest(categoryKey, skillName); };
    document.getElementById('uploadCertBtn').onclick = function() { uploadExternalCertificate(categoryKey, skillName); };
    document.getElementById('viewSampleBtn').onclick = function() { viewSampleQuestions(categoryKey, skillName); };
}

function startSkillTest(categoryKey, skillName) {
    if (!currentUser) {
        showSuccess("Please login first to take the test.");
        showModal('loginModal');
        return;
    }

    var skillProgress = {
        category: categoryKey,
        skill: skillName,
        startDate: new Date().toISOString(),
        status: 'in_progress',
        progress: 0
    };

    userSkillProgress.inProgress.push(skillProgress);
    updateProgressDashboard();

    currentQuestion = 0;
    testAnswers = [];

    currentUser.currentTest = {
        category: categoryKey,
        skill: skillName,
        questions: generateTestQuestions(categoryKey, skillName)
    };

    showModal('testModal');
    loadTestQuestion();
    showSuccess('Starting ' + skillName + ' assessment. Good luck!');
}

function generateTestQuestions(categoryKey, skillName) {
    var category = skillDatabase[categoryKey];
    var skill = category.skills.find(function(s) { return s.name === skillName; });
    var questionCount = skill.difficulty === 'Beginner' ? 15 : skill.difficulty === 'Intermediate' ? 20 : 25;

    var questions = [];
    for (var i = 0; i < questionCount; i++) {
        var topic = skill.topics[i % skill.topics.length];
        questions.push({
            question: 'Which of the following best describes ' + topic + ' in ' + skillName + '?',
            options: [
                'Basic understanding of ' + topic,
                'Advanced implementation of ' + topic,
                'Professional expertise in ' + topic
            ],
            correct: Math.floor(Math.random() * 3),
            topic: topic
        });
    }
    return questions;
}

function loadTestQuestion() {
    if (!currentUser.currentTest) return;

    var questions = currentUser.currentTest.questions;
    if (currentQuestion >= questions.length) {
        completeSkillTest();
        return;
    }

    var question = questions[currentQuestion];
    var testContent = document.getElementById('testContent');

    testContent.innerHTML =
        '<div class="mb-6">' +
            '<div class="flex justify-between items-center mb-4">' +
                '<h4 class="text-lg font-semibold">Question ' + (currentQuestion + 1) + ' of ' + questions.length + '</h4>' +
                '<div class="text-sm text-gray-500">Topic: ' + question.topic + '</div>' +
            '</div>' +
            '<div class="bg-blue-50 p-4 rounded-lg mb-4">' +
                '<div class="text-sm text-blue-600 mb-2">Testing: ' + currentUser.currentTest.skill + '</div>' +
                '<div class="w-full bg-blue-200 rounded-full h-2">' +
                    '<div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ' + ((currentQuestion / questions.length) * 100) + '%"></div>' +
                '</div>' +
            '</div>' +
            '<p class="mb-4 text-lg">' + question.question + '</p>' +
            '<div class="space-y-3">' +
                question.options.map(function(option, index) {
                    return '<label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">' +
                        '<input type="radio" name="currentQ" value="' + index + '" class="mr-3">' +
                        '<span>' + option + '</span>' +
                    '</label>';
                }).join('') +
            '</div>' +
        '</div>' +
        '<div class="flex justify-between">' +
            '<button id="prevQuestion" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors" ' + (currentQuestion === 0 ? 'disabled' : '') + '>Previous</button>' +
            '<button id="nextQuestion" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">' + (currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next Question') + '</button>' +
        '</div>';

    document.getElementById('nextQuestion').addEventListener('click', nextTestQuestion);
    document.getElementById('prevQuestion').addEventListener('click', prevTestQuestion);
}

function nextTestQuestion() {
    var selected = document.querySelector('input[name="currentQ"]:checked');
    if (selected) {
        testAnswers[currentQuestion] = parseInt(selected.value);
        currentQuestion++;
        loadTestQuestion();
    } else {
        alert('Please select an answer before proceeding.');
    }
}

function prevTestQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadTestQuestion();
    }
}

function completeSkillTest() {
    hideModal('testModal');

    var questions = currentUser.currentTest.questions;
    var score = 0;
    testAnswers.forEach(function(answer, index) {
        if (answer === questions[index].correct) score++;
    });

    var percentage = Math.round((score / questions.length) * 100);
    var skillName = currentUser.currentTest.skill;
    var categoryKey = currentUser.currentTest.category;
    var testPath = currentUser.currentTest.path;

    var progressIndex = userSkillProgress.inProgress.findIndex(function(p) { return p.skill === skillName; });
    if (progressIndex !== -1) {
        userSkillProgress.inProgress.splice(progressIndex, 1);
    }

    if (percentage >= 70) {
        if (testPath === 'aitest') {
            showSuccess('Great! You scored ' + percentage + '% on ' + skillName + '. Now sending to mentor for review...');

            document.getElementById('aitest-progress1').style.width = '100%';
            document.getElementById('aitest-step2').classList.remove('bg-gray-300', 'text-gray-600');
            document.getElementById('aitest-step2').classList.add('bg-green-500', 'text-white');

            var aitestCurrentStep = document.getElementById('aitestCurrentStep');
            aitestCurrentStep.innerHTML =
                '<h4 class="text-lg font-semibold mb-4 text-green-800">AI Test Completed</h4>' +
                '<div class="bg-green-50 p-4 rounded-lg mb-4">' +
                    '<div class="flex items-center space-x-2 mb-3">' +
                        '<span class="text-green-600 text-2xl">&#x1F3AF;</span>' +
                        '<div>' +
                            '<div class="font-semibold text-green-800">Test Score: ' + percentage + '%</div>' +
                            '<div class="text-sm text-green-600">Passed with flying colors!</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="bg-blue-50 p-4 rounded-lg">' +
                    '<div class="flex items-center space-x-2 mb-2">' +
                        '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>' +
                        '<span class="text-blue-800 font-semibold">Mentor Review in Progress...</span>' +
                    '</div>' +
                    '<p class="text-blue-600 text-sm">Industry expert is validating your test results. This usually takes 24-48 hours.</p>' +
                '</div>';

            setTimeout(function() {
                completeMentorReview(skillName, categoryKey, percentage, 'aitest');
            }, 4000);

        } else {
            var completedSkill = {
                category: categoryKey,
                skill: skillName,
                score: percentage,
                completedDate: new Date().toISOString(),
                nftMinted: false
            };

            userSkillProgress.completed.push(completedSkill);
            userSkillProgress.scores[skillName] = percentage;

            if (currentUser) {
                currentUser.skillProgress = userSkillProgress;
                localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
            }

            updateProgressDashboard();
            showSuccess('Congratulations! You scored ' + percentage + '% on ' + skillName + '. You can now mint your NFT badge!');

            setTimeout(function() {
                if (confirm('Would you like to mint your NFT badge for ' + skillName + ' now?')) {
                    mintSkillNFT(categoryKey, skillName, percentage);
                }
            }, 2000);
        }

    } else {
        showSuccess('You scored ' + percentage + '% on ' + skillName + '. You need 70% or higher to pass. You can retake the test anytime!');
    }
}

function completeMentorReview(skillName, categoryKey, testScore, pathType) {
    var mentorBonus = Math.floor(Math.random() * 6) + 5;
    var finalScore = Math.min(100, testScore + mentorBonus);

    if (pathType === 'aitest') {
        document.getElementById('aitest-progress2').style.width = '100%';
        document.getElementById('aitest-step3').classList.remove('bg-gray-300', 'text-gray-600');
        document.getElementById('aitest-step3').classList.add('bg-purple-500', 'text-white');

        var aitestCurrentStep = document.getElementById('aitestCurrentStep');
        aitestCurrentStep.innerHTML =
            '<h4 class="text-lg font-semibold mb-4 text-purple-800">Mentor Review Complete!</h4>' +
            '<div class="bg-purple-50 p-4 rounded-lg mb-4">' +
                '<div class="flex items-center space-x-2 mb-3">' +
                    '<span class="text-purple-600 text-2xl">&#x1F468;&#x200D;&#x1F3EB;</span>' +
                    '<div>' +
                        '<div class="font-semibold text-purple-800">Mentor Approved</div>' +
                        '<div class="text-sm text-purple-600">Industry expert validated your knowledge</div>' +
                    '</div>' +
                '</div>' +
                '<div class="space-y-2 text-sm">' +
                    '<div class="flex justify-between"><span class="text-purple-700">AI Test Score:</span><span class="font-semibold text-purple-800">' + testScore + '%</span></div>' +
                    '<div class="flex justify-between"><span class="text-purple-700">Mentor Bonus:</span><span class="font-semibold text-green-800">+' + mentorBonus + ' points</span></div>' +
                    '<div class="flex justify-between"><span class="text-purple-700">Final Score:</span><span class="font-semibold text-purple-800">' + finalScore + '%</span></div>' +
                    '<div class="flex justify-between"><span class="text-purple-700">Trust Score:</span><span class="font-semibold text-purple-800">' + finalScore + '/100</span></div>' +
                '</div>' +
            '</div>' +
            '<button onclick="mintMentorVerifiedNFT(\'' + skillName.replace(/'/g, "\\'") + '\', \'' + categoryKey + '\', ' + finalScore + ')" class="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors">Mint Mentor-Verified NFT Badge</button>';
    }

    showSuccess('Mentor review complete! Your ' + skillName + ' skill has been approved with ' + finalScore + '% final score. Ready to mint NFT!');
}

function mintMentorVerifiedNFT(skillName, categoryKey, finalScore) {
    var category = skillDatabase[categoryKey];

    var newNFT = {
        id: Date.now(),
        skill: skillName,
        category: categoryKey,
        level: finalScore >= 95 ? "Expert" : finalScore >= 85 ? "Advanced" : "Verified",
        score: finalScore,
        mintDate: new Date().toLocaleDateString(),
        tokenId: "0x" + Math.random().toString(16).substr(2, 8),
        image: category.icon,
        trustScore: finalScore,
        verificationType: 'aitest',
        mentorVerified: true,
        badges: ['AI Tested', 'Mentor Approved', 'Blockchain Verified']
    };

    userNFTs.push(newNFT);

    var completedSkill = {
        category: categoryKey,
        skill: skillName,
        score: finalScore,
        completedDate: new Date().toISOString(),
        nftMinted: true,
        nftId: newNFT.id,
        verificationType: 'aitest',
        mentorVerified: true
    };

    userSkillProgress.completed.push(completedSkill);
    userSkillProgress.scores[skillName] = finalScore;

    if (currentUser) {
        currentUser.nfts = userNFTs;
        currentUser.skillProgress = userSkillProgress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    updateNFTGallery();
    updateProgressDashboard();
    showSuccess('Mentor-verified NFT Badge minted successfully for ' + skillName + '! Your blockchain certificate is now live.');

    setTimeout(function() {
        showPage('nftPage');
    }, 2000);
}

function mintSkillNFT(categoryKey, skillName, score) {
    var category = skillDatabase[categoryKey];

    var newNFT = {
        id: Date.now(),
        skill: skillName,
        category: categoryKey,
        level: score >= 90 ? "Expert" : score >= 80 ? "Advanced" : "Verified",
        score: score,
        mintDate: new Date().toLocaleDateString(),
        tokenId: "0x" + Math.random().toString(16).substr(2, 8),
        image: category.icon,
        trustScore: Math.min(100, score + Math.floor(Math.random() * 10))
    };

    userNFTs.push(newNFT);

    var completedSkill = userSkillProgress.completed.find(function(s) { return s.skill === skillName; });
    if (completedSkill) {
        completedSkill.nftMinted = true;
        completedSkill.nftId = newNFT.id;
    }

    if (currentUser) {
        currentUser.nfts = userNFTs;
        currentUser.skillProgress = userSkillProgress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    updateNFTGallery();
    updateProgressDashboard();
    showSuccess('NFT Badge minted successfully for ' + skillName + '! Your blockchain certificate is now live.');
}

function uploadExternalCertificate(categoryKey, skillName) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            showSuccess('Certificate "' + file.name + '" uploaded for ' + skillName + '! Processing external validation...');

            setTimeout(function() {
                var validationScore = 85 + Math.floor(Math.random() * 15);

                var completedSkill = {
                    category: categoryKey,
                    skill: skillName,
                    score: validationScore,
                    completedDate: new Date().toISOString(),
                    nftMinted: false,
                    validationType: 'external',
                    certificateFile: file.name
                };

                userSkillProgress.completed.push(completedSkill);
                userSkillProgress.scores[skillName] = validationScore;

                updateProgressDashboard();
                showSuccess('External certificate validated! Score: ' + validationScore + '%. You can now mint your NFT badge.');

                setTimeout(function() {
                    if (confirm('Would you like to mint your NFT badge for ' + skillName + ' now?')) {
                        mintSkillNFT(categoryKey, skillName, validationScore);
                    }
                }, 1500);

            }, 3000);
        }
    };
    fileInput.click();
}

function viewSampleQuestions(categoryKey, skillName) {
    var category = skillDatabase[categoryKey];
    var skill = category.skills.find(function(s) { return s.name === skillName; });

    var sampleQuestions = [
        {
            question: 'What is the most important aspect of ' + skill.topics[0] + ' in ' + skillName + '?',
            options: ["Basic implementation", "Best practices", "Advanced techniques"],
            correct: 1
        },
        {
            question: 'How would you approach ' + skill.topics[1] + ' in a professional setting?',
            options: ["Follow guidelines", "Use industry standards", "Apply creative solutions"],
            correct: 1
        }
    ];

    var questionCount = skill.difficulty === 'Beginner' ? 15 : skill.difficulty === 'Intermediate' ? 20 : 25;

    var sampleContent =
        '<div class="space-y-6">' +
            '<h4 class="text-lg font-semibold">Sample Questions for ' + skillName + '</h4>' +
            sampleQuestions.map(function(q, index) {
                return '<div class="bg-gray-50 p-4 rounded-lg">' +
                    '<p class="font-medium mb-3">Sample Question ' + (index + 1) + ':</p>' +
                    '<p class="mb-3">' + q.question + '</p>' +
                    '<div class="space-y-2">' +
                        q.options.map(function(option, i) {
                            return '<div class="flex items-center">' +
                                '<span class="w-6 h-6 rounded-full border-2 ' + (i === q.correct ? 'bg-green-500 border-green-500' : 'border-gray-300') + ' flex items-center justify-center mr-3">' +
                                    (i === q.correct ? '&#x2713;' : String.fromCharCode(65 + i)) +
                                '</span>' +
                                '<span class="' + (i === q.correct ? 'text-green-700 font-medium' : '') + '">' + option + '</span>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                '</div>';
            }).join('') +
            '<div class="bg-blue-50 p-4 rounded-lg">' +
                '<p class="text-blue-800 text-sm"><strong>Tip:</strong> The actual test will have ' + questionCount + ' questions covering all topics: ' + skill.topics.join(', ') + '</p>' +
            '</div>' +
        '</div>';

    document.getElementById('testContent').innerHTML = sampleContent;
    showModal('testModal');
}

function updateProgressDashboard() {
    document.getElementById('totalSkillsCompleted').textContent = userSkillProgress.completed.length;
    document.getElementById('totalNFTsMinted').textContent = userNFTs.length;

    var avgScore = userSkillProgress.completed.length > 0
        ? Math.round(userSkillProgress.completed.reduce(function(sum, skill) { return sum + skill.score; }, 0) / userSkillProgress.completed.length)
        : 0;
    document.getElementById('overallTrustScore').textContent = avgScore;

    var inProgressDiv = document.getElementById('inProgressSkills');
    if (userSkillProgress.inProgress.length === 0) {
        inProgressDiv.innerHTML =
            '<div class="text-center text-gray-500 py-8">' +
                '<div class="text-4xl mb-2">&#x1F3AF;</div>' +
                '<p>No skills in progress</p>' +
                '<p class="text-sm">Start a test to see progress here</p>' +
            '</div>';
    } else {
        inProgressDiv.innerHTML = userSkillProgress.inProgress.map(function(skill) {
            return '<div class="bg-blue-50 p-4 rounded-lg">' +
                '<h6 class="font-semibold text-blue-800">' + skill.skill + '</h6>' +
                '<p class="text-blue-600 text-sm">' + skillDatabase[skill.category].name + '</p>' +
                '<div class="mt-2">' +
                    '<div class="w-full bg-blue-200 rounded-full h-2">' +
                        '<div class="bg-blue-600 h-2 rounded-full" style="width: ' + skill.progress + '%"></div>' +
                    '</div>' +
                    '<p class="text-xs text-blue-600 mt-1">' + skill.progress + '% Complete</p>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    var completedDiv = document.getElementById('completedSkills');
    if (userSkillProgress.completed.length === 0) {
        completedDiv.innerHTML =
            '<div class="text-center text-gray-500 py-8">' +
                '<div class="text-4xl mb-2">&#x1F3C6;</div>' +
                '<p>No completed skills yet</p>' +
                '<p class="text-sm">Complete tests to earn NFT badges</p>' +
            '</div>';
    } else {
        completedDiv.innerHTML = userSkillProgress.completed.map(function(skill) {
            return '<div class="bg-green-50 p-4 rounded-lg">' +
                '<div class="flex justify-between items-start mb-2">' +
                    '<h6 class="font-semibold text-green-800">' + skill.skill + '</h6>' +
                    '<span class="text-green-600 text-sm font-bold">' + skill.score + '%</span>' +
                '</div>' +
                '<p class="text-green-600 text-sm mb-2">' + skillDatabase[skill.category].name + '</p>' +
                '<div class="flex justify-between items-center">' +
                    '<span class="text-xs text-green-600">' + new Date(skill.completedDate).toLocaleDateString() + '</span>' +
                    (skill.nftMinted
                        ? '<span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">NFT Minted</span>'
                        : '<button onclick="mintSkillNFT(\'' + skill.category + '\', \'' + skill.skill.replace(/'/g, "\\'") + '\', ' + skill.score + ')" class="text-xs bg-green-600 text-white px-2 py-1 rounded-full hover:bg-green-700">Mint NFT</button>'
                    ) +
                '</div>' +
            '</div>';
        }).join('');
    }

    updateAIRecommendations();
}

function updateAIRecommendations() {
    var recommendedDiv = document.getElementById('recommendedSkills');

    var completedCategories = [];
    userSkillProgress.completed.forEach(function(s) {
        if (completedCategories.indexOf(s.category) === -1) {
            completedCategories.push(s.category);
        }
    });

    var allCategories = Object.keys(skillDatabase);
    var untriedCategories = allCategories.filter(function(cat) { return completedCategories.indexOf(cat) === -1; });

    if (untriedCategories.length === 0) {
        var recommendations = completedCategories.slice(0, 3).map(function(cat) {
            var category = skillDatabase[cat];
            var advancedSkill = category.skills.find(function(s) { return s.difficulty === 'Advanced'; }) || category.skills[0];
            return { category: cat, skill: advancedSkill };
        });

        recommendedDiv.innerHTML = recommendations.map(function(rec) {
            return '<div class="bg-purple-50 p-4 rounded-lg cursor-pointer hover:bg-purple-100" onclick="selectIndividualSkill(\'' + rec.category + '\', \'' + rec.skill.name.replace(/'/g, "\\'") + '\')">' +
                '<h6 class="font-semibold text-purple-800">' + rec.skill.name + '</h6>' +
                '<p class="text-purple-600 text-sm">' + skillDatabase[rec.category].name + '</p>' +
                '<div class="flex justify-between items-center mt-2">' +
                    '<span class="text-xs text-purple-600">' + rec.skill.difficulty + '</span>' +
                    '<span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Upgrade</span>' +
                '</div>' +
            '</div>';
        }).join('');
    } else {
        var recs = untriedCategories.slice(0, 3).map(function(cat) {
            var category = skillDatabase[cat];
            var beginnerSkill = category.skills.find(function(s) { return s.difficulty === 'Beginner'; }) || category.skills[0];
            return { category: cat, skill: beginnerSkill };
        });

        recommendedDiv.innerHTML = recs.map(function(rec) {
            return '<div class="bg-purple-50 p-4 rounded-lg cursor-pointer hover:bg-purple-100" onclick="selectIndividualSkill(\'' + rec.category + '\', \'' + rec.skill.name.replace(/'/g, "\\'") + '\')">' +
                '<h6 class="font-semibold text-purple-800">' + rec.skill.name + '</h6>' +
                '<p class="text-purple-600 text-sm">' + skillDatabase[rec.category].name + '</p>' +
                '<div class="flex justify-between items-center mt-2">' +
                    '<span class="text-xs text-purple-600">' + rec.skill.demand + ' Demand</span>' +
                    '<span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">New</span>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    if (recommendedDiv.children.length > 0) {
        var firstRec = recommendedDiv.children[0];
        var h6 = firstRec.querySelector('h6');
        if (h6) {
            document.getElementById('nextRecommendation').textContent = h6.textContent.split(' ')[0];
        }
    }
}

// Enhanced project system
var allProjects = [];
var currentProjectFilter = 'all';

function loadProjects() {
    var projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    allProjects = [
        { id: 1, title: "E-commerce Website Development", category: "tech", categoryDisplay: "Technology", budget: "\u20B92,50,000", budgetETH: "2.5 ETH", deadline: "2024-02-15", description: "Build a modern e-commerce platform with React and Node.js.", employer: "TechCorp Inc.", skillsRequired: ["React.js", "Node.js", "MongoDB", "Blockchain"], applicants: 12, status: "open", postedDate: "2024-01-15", escrow: true },
        { id: 2, title: "Mobile App UI/UX Design", category: "design", categoryDisplay: "Design", budget: "\u20B91,80,000", budgetETH: "1.8 ETH", deadline: "2024-02-20", description: "Design user interface for a fitness tracking mobile application.", employer: "FitLife Studios", skillsRequired: ["UI Design", "UX Research", "Figma", "Mobile Design"], applicants: 8, status: "open", postedDate: "2024-01-18", escrow: true },
        { id: 3, title: "Digital Marketing Campaign", category: "business", categoryDisplay: "Marketing", budget: "\u20B93,00,000", budgetETH: "3.0 ETH", deadline: "2024-02-25", description: "Create a comprehensive digital marketing strategy for SaaS product launch.", employer: "Growth Marketing Co.", skillsRequired: ["Digital Marketing", "SEO", "Social Media", "Analytics"], applicants: 15, status: "open", postedDate: "2024-01-20", escrow: false },
        { id: 4, title: "Blockchain Smart Contract Development", category: "tech", categoryDisplay: "Technology", budget: "\u20B94,50,000", budgetETH: "4.5 ETH", deadline: "2024-03-01", description: "Develop DeFi protocol smart contracts with security audit.", employer: "DeFi Innovations", skillsRequired: ["Solidity", "Smart Contracts", "Web3", "Security"], applicants: 6, status: "open", postedDate: "2024-01-22", escrow: true },
        { id: 5, title: "Brand Identity Design Package", category: "design", categoryDisplay: "Design", budget: "\u20B91,20,000", budgetETH: "1.2 ETH", deadline: "2024-02-28", description: "Complete brand identity including logo, colors, typography for fintech startup.", employer: "FinTech Startup", skillsRequired: ["Brand Design", "Logo Design", "Typography", "Brand Strategy"], applicants: 10, status: "open", postedDate: "2024-01-25", escrow: true },
        { id: 6, title: "Financial Analysis & Modeling", category: "business", categoryDisplay: "Finance", budget: "\u20B92,00,000", budgetETH: "2.0 ETH", deadline: "2024-03-05", description: "Create comprehensive financial models and analysis for investment decision.", employer: "Investment Firm", skillsRequired: ["Financial Analysis", "Excel Modeling", "Investment Analysis", "Risk Assessment"], applicants: 4, status: "open", postedDate: "2024-01-28", escrow: true }
    ];

    displayProjects(allProjects);
}

function displayProjects(projects) {
    var projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    if (projects.length === 0) {
        projectsList.innerHTML = '<div class="col-span-full text-center py-12"><div class="text-4xl mb-4">&#x1F50D;</div><h4 class="text-xl font-semibold mb-2">No Projects Found</h4><p class="text-gray-600">Try adjusting your filters or check back later</p></div>';
        return;
    }

    projectsList.innerHTML = projects.map(function(project) {
        return '<div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">' +
            '<div class="flex justify-between items-start mb-4">' +
                '<h4 class="text-lg font-semibold">' + project.title + '</h4>' +
                '<div class="flex flex-col items-end space-y-1">' +
                    '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">' + project.categoryDisplay + '</span>' +
                    (project.escrow ? '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">&#x1F512; Escrow</span>' : '') +
                '</div>' +
            '</div>' +
            '<p class="text-gray-600 mb-4">' + project.description + '</p>' +
            '<div class="mb-4"><div class="text-sm font-semibold text-gray-700 mb-2">Skills Required:</div><div class="flex flex-wrap gap-1">' +
                project.skillsRequired.map(function(skill) {
                    return '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">' + skill + '</span>';
                }).join('') +
            '</div></div>' +
            '<div class="space-y-2 text-sm text-gray-500 mb-4">' +
                '<div class="flex justify-between"><span>Budget:</span><div class="text-right"><div class="font-semibold text-green-600">' + project.budget + '</div><div class="text-xs text-gray-500">' + project.budgetETH + '</div></div></div>' +
                '<div class="flex justify-between"><span>Deadline:</span><span>' + new Date(project.deadline).toLocaleDateString() + '</span></div>' +
                '<div class="flex justify-between"><span>Employer:</span><span class="font-medium">' + project.employer + '</span></div>' +
                '<div class="flex justify-between"><span>Applicants:</span><span class="text-orange-600 font-medium">' + project.applicants + ' applied</span></div>' +
            '</div>' +
            '<div class="flex space-x-2">' +
                '<button onclick="applyForProject(' + project.id + ')" class="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold">Apply Now</button>' +
                '<button onclick="viewProjectDetails(' + project.id + ')" class="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">Details</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function applyForProject(projectId) {
    if (!currentUser) {
        showSuccess("Please login first to apply for projects.");
        showModal('loginModal');
        return;
    }

    if (userSkillProgress.completed.length === 0) {
        showSuccess("Complete at least one skill verification to apply for projects.");
        showPage('skillsPage');
        return;
    }

    var project = allProjects.find(function(p) { return p.id === projectId; });
    if (!project) return;

    project.applicants += 1;
    showSuccess('Application submitted for "' + project.title + '"! The employer will review your verified skills and contact you soon.');

    if (!currentUser.appliedProjects) {
        currentUser.appliedProjects = [];
    }
    currentUser.appliedProjects.push({
        projectId: projectId,
        appliedDate: new Date().toISOString(),
        status: 'pending'
    });

    localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    displayProjects(currentProjectFilter === 'all' ? allProjects : allProjects.filter(function(p) { return p.category === currentProjectFilter; }));
}

function viewProjectDetails(projectId) {
    var project = allProjects.find(function(p) { return p.id === projectId; });
    if (!project) return;

    var detailsHTML =
        '<div class="space-y-6">' +
            '<div class="text-center">' +
                '<h3 class="text-2xl font-bold mb-2">' + project.title + '</h3>' +
                '<div class="flex justify-center space-x-2 mb-4">' +
                    '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">' + project.categoryDisplay + '</span>' +
                    (project.escrow ? '<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">&#x1F512; Escrow Protected</span>' : '') +
                '</div>' +
            '</div>' +
            '<div class="bg-gray-50 p-4 rounded-lg"><h4 class="font-semibold mb-2">Project Description</h4><p class="text-gray-700">' + project.description + '</p></div>' +
            '<div class="grid md:grid-cols-2 gap-4">' +
                '<div class="bg-green-50 p-4 rounded-lg"><h4 class="font-semibold text-green-800 mb-2">Budget</h4><div class="text-2xl font-bold text-green-600">' + project.budget + '</div><div class="text-sm text-green-600">' + project.budgetETH + '</div></div>' +
                '<div class="bg-orange-50 p-4 rounded-lg"><h4 class="font-semibold text-orange-800 mb-2">Deadline</h4><div class="text-lg font-bold text-orange-600">' + new Date(project.deadline).toLocaleDateString() + '</div></div>' +
            '</div>' +
            '<div class="bg-purple-50 p-4 rounded-lg"><h4 class="font-semibold text-purple-800 mb-3">Required Skills</h4><div class="flex flex-wrap gap-2">' +
                project.skillsRequired.map(function(skill) {
                    return '<span class="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">' + skill + '</span>';
                }).join('') +
            '</div></div>' +
            '<div class="bg-blue-50 p-4 rounded-lg"><h4 class="font-semibold text-blue-800 mb-2">Employer Information</h4><div class="text-blue-700"><div class="font-medium">' + project.employer + '</div><div class="text-sm">Posted on ' + new Date(project.postedDate).toLocaleDateString() + '</div><div class="text-sm">' + project.applicants + ' applications received</div></div></div>' +
            '<div class="flex space-x-3">' +
                '<button onclick="applyForProject(' + project.id + '); hideModal(\'testModal\');" class="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold">Apply for This Project</button>' +
                '<button onclick="hideModal(\'testModal\')" class="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors">Close</button>' +
            '</div>' +
        '</div>';

    document.getElementById('testContent').innerHTML = detailsHTML;
    showModal('testModal');
}

function showSampleVerification() {
    var resultDiv = document.getElementById('verificationResult');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML =
        '<h5 class="font-semibold mb-3 text-green-800">Verification Successful</h5>' +
        '<div class="space-y-3">' +
            '<div class="flex justify-between"><span>Candidate:</span><span class="font-semibold">Onkar Garde</span></div>' +
            '<div class="flex justify-between"><span>Wallet Address:</span><span class="font-mono text-sm">0xabc123...def456</span></div>' +
            '<div class="flex justify-between"><span>Verified Skills:</span><div class="text-right"><div class="text-green-600">&#x2713; React Development</div><div class="text-green-600">&#x2713; Node.js Backend</div><div class="text-green-600">&#x2713; UI/UX Design</div></div></div>' +
            '<div class="flex justify-between"><span>NFT Badges:</span><span class="text-blue-600 font-semibold">5 Active</span></div>' +
            '<div class="flex justify-between"><span>Trust Score:</span><span class="text-purple-600 font-semibold">98/100</span></div>' +
            '<div class="flex justify-between"><span>Projects Completed:</span><span class="text-orange-600 font-semibold">12</span></div>' +
            '<div class="mt-4 p-3 bg-green-50 rounded-lg"><div class="text-green-800 font-semibold">Recommendation: Highly Qualified</div><div class="text-green-600 text-sm">This candidate has excellent verified skills and a strong track record.</div></div>' +
        '</div>';
}

function startAITest() {
    if (!currentUser) {
        showSuccess("Please login first to take the assessment.");
        return;
    }
    currentQuestion = 0;
    testAnswers = [];
    showModal('testModal');
    loadQuestion();
}

function loadQuestion() {
    if (currentUser && currentUser.currentTest) {
        loadTestQuestion();
    } else {
        showSuccess("Please select a skill first to start the test.");
        hideModal('testModal');
        showPage('skillsPage');
    }
}

function nextQuestion() {
    nextTestQuestion();
}

function prevQuestion() {
    prevTestQuestion();
}

function completeTest() {
    completeSkillTest();
}

function startPeerReview() {
    if (!verificationProgress.aiTest) {
        showSuccess("Please complete the AI assessment first.");
        return;
    }
    showSuccess("Peer review initiated! You'll be matched with 3 industry experts within 24 hours.");
    setTimeout(function() {
        verificationProgress.peerReview = true;
        showSuccess("Peer review completed! All 3 reviewers approved your skills. Upload your certificate to finish.");
    }, 3000);
}

function uploadCertificate() {
    if (!verificationProgress.peerReview) {
        showSuccess("Please complete peer review first.");
        return;
    }
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            showSuccess('Certificate "' + file.name + '" uploaded successfully! Processing...');
            setTimeout(function() {
                verificationProgress.certificate = true;
                showSuccess("All verification steps completed! You can now mint your NFT badge.");
            }, 2000);
        }
    };
    fileInput.click();
}

function mintNFT() {
    if (!currentUser) {
        showSuccess("Please login first to mint NFT badges.");
        return;
    }
    if (!currentUser.wallet) {
        showSuccess("Please connect your wallet first to mint NFT badges.");
        return;
    }
    if (userSkillProgress.completed.length === 0) {
        showSuccess("Complete at least one skill verification to mint your NFT badge.");
        return;
    }

    var transactionStatus = document.getElementById('transactionStatus');
    var txHash = document.getElementById('txHash');
    var transactionHash = "0x" + Math.random().toString(16).substr(2, 64);
    txHash.textContent = transactionHash;

    transactionStatus.classList.remove('hidden');
    document.getElementById('mintNFTBtn').disabled = true;
    document.getElementById('mintNFTBtn').textContent = "Minting in Progress...";

    setTimeout(function() {
        var latestSkill = userSkillProgress.completed[userSkillProgress.completed.length - 1];
        var category = skillDatabase[latestSkill.category];

        var newNFT = {
            id: Date.now(),
            skill: latestSkill.skill,
            category: latestSkill.category,
            level: latestSkill.score >= 90 ? "Expert" : latestSkill.score >= 80 ? "Advanced" : "Verified",
            score: latestSkill.score,
            mintDate: new Date().toLocaleDateString(),
            tokenId: "0x" + Math.random().toString(16).substr(2, 8),
            transactionHash: transactionHash,
            image: category.icon,
            trustScore: Math.min(100, latestSkill.score + Math.floor(Math.random() * 10)),
            blockchain: "Ethereum",
            standard: "ERC-721",
            storage: "IPFS"
        };

        userNFTs.push(newNFT);
        latestSkill.nftMinted = true;
        latestSkill.nftId = newNFT.id;

        if (currentUser) {
            currentUser.nfts = userNFTs;
            currentUser.skillProgress = userSkillProgress;
            localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
        }

        transactionStatus.innerHTML =
            '<div class="flex items-center justify-center space-x-2 mb-2">' +
                '<div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><span class="text-white text-xs">&#x2713;</span></div>' +
                '<span class="text-green-800 font-semibold">NFT Minted Successfully!</span>' +
            '</div>' +
            '<p class="text-green-600 text-sm">Transaction Hash: <span class="font-mono">' + transactionHash + '</span></p>';

        document.getElementById('mintNFTBtn').disabled = false;
        document.getElementById('mintNFTBtn').innerHTML = "&#x1F3AF; Mint Skill NFT Badge";

        document.getElementById('nftPreviewSkill').textContent = newNFT.skill;
        document.getElementById('nftPreviewLevel').textContent = newNFT.level;

        updateNFTGallery();
        updateProgressDashboard();
        showSuccess('NFT Badge minted successfully for ' + newNFT.skill + '! Your blockchain certificate is now live.');
    }, 3000);
}

function updateNFTGallery() {
    var gallery = document.getElementById('nftGallery');

    if (userNFTs.length === 0) {
        gallery.innerHTML =
            '<div class="col-span-full text-center py-12">' +
                '<div class="text-6xl mb-4">&#x1F3AF;</div>' +
                '<h4 class="text-xl font-semibold mb-2">No NFT Badges Yet</h4>' +
                '<p class="text-gray-600">Complete skill verification to mint your first NFT badge</p>' +
                '<button onclick="showPage(\'skillsPage\')" class="mt-4 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">Start Verification</button>' +
            '</div>';
        return;
    }

    gallery.innerHTML = userNFTs.map(function(nft) {
        return '<div class="bg-white p-6 rounded-xl shadow-lg nft-glow hover:scale-105 transition-transform">' +
            '<div class="text-center">' +
                '<div class="text-6xl mb-4">' + nft.image + '</div>' +
                '<h4 class="text-xl font-semibold mb-2">' + nft.skill + '</h4>' +
                '<div class="skill-badge text-white px-3 py-1 rounded-full text-sm mb-3">' + nft.level + '</div>' +
                '<div class="flex flex-wrap justify-center gap-1 mb-3">' +
                    (nft.verificationType === 'certificate'
                        ? '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">&#x1F4DC; Certificate</span><span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">' + (nft.certificateSource || '') + '</span>'
                        : '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">&#x1F916; AI Tested</span>'
                    ) +
                    (nft.mentorVerified
                        ? '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">&#x1F468;&#x200D;&#x1F3EB; Mentor</span>'
                        : ''
                    ) +
                    (nft.enhanced
                        ? '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">&#x2B50; Premium</span>'
                        : ''
                    ) +
                '</div>' +
                '<div class="space-y-1 text-sm">' +
                    '<p class="text-gray-600">Minted: ' + nft.mintDate + '</p>' +
                    '<p class="text-purple-600 font-semibold">Trust Score: ' + (nft.trustScore || 95) + '/100</p>' +
                    (nft.certificateSource ? '<p class="text-green-600 text-xs">Source: ' + nft.certificateSource + '</p>' : '') +
                    '<p class="text-gray-500 text-xs">Token: ' + nft.tokenId + '</p>' +
                '</div>' +
                '<div class="mt-4 flex space-x-2">' +
                    '<button class="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-blue-600 transition-colors">View Details</button>' +
                    '<button class="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-green-600 transition-colors">Share Badge</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    var badgeCountElement = document.getElementById('badgeCount');
    if (badgeCountElement) {
        badgeCountElement.textContent = userNFTs.length;
    }
}

function verifyCandidate() {
    var walletAddress = document.getElementById('candidateWallet').value;
    if (!walletAddress) {
        alert('Please enter a wallet address');
        return;
    }

    var resultDiv = document.getElementById('verificationResult');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML =
        '<h5 class="font-semibold mb-3">Verification Results</h5>' +
        '<div class="space-y-2">' +
            '<div class="flex justify-between"><span>Wallet Address:</span><span class="font-mono text-sm">' + walletAddress + '</span></div>' +
            '<div class="flex justify-between"><span>Verified Skills:</span><span class="text-green-600">&#x2713; JavaScript, React, Node.js</span></div>' +
            '<div class="flex justify-between"><span>NFT Badges:</span><span class="text-blue-600">3 Active</span></div>' +
            '<div class="flex justify-between"><span>Trust Score:</span><span class="text-purple-600 font-semibold">95/100</span></div>' +
        '</div>';
}

function postProject() {
    var title = document.getElementById('projectTitle').value;
    var description = document.getElementById('projectDescription').value;
    var budget = document.getElementById('projectBudget').value;

    if (!title || !description || !budget) {
        alert('Please fill in all project details');
        return;
    }

    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectBudget').value = '';

    showSuccess('Project "' + title + '" posted successfully! Smart contract created with ' + budget + ' ETH budget.');
}

function loadUserData() {
    var userData = localStorage.getItem('skillchain_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        userNFTs = currentUser.nfts || [];
        verificationProgress = currentUser.verificationProgress || verificationProgress;
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        document.getElementById('loginBtn').textContent = currentUser.name;
        document.getElementById('registerBtn').style.display = 'none';
    }
}

function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    showModal('successModal');
}

function shareProfile(platform) {
    var profileUrl = 'https://skillchain.io/profile/' + (currentUser ? currentUser.name.toLowerCase().replace(' ', '') : 'user');
    var message = 'Check out my verified skills on SkillChain! I have ' + userNFTs.length + ' blockchain-certified skill badges.';

    switch(platform) {
        case 'email':
            window.open('mailto:?subject=My SkillChain Profile&body=' + message + ' ' + profileUrl, '_blank');
            break;
        case 'linkedin':
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(profileUrl), '_blank');
            break;
        case 'github':
            copyProfileLink();
            showSuccess("Profile link copied! You can add it to your GitHub profile README.");
            return;
    }
    showSuccess('Profile shared on ' + platform.charAt(0).toUpperCase() + platform.slice(1) + '!');
}

function copyProfileLink() {
    var profileUrl = 'https://skillchain.io/profile/' + (currentUser ? currentUser.name.toLowerCase().replace(' ', '') : 'user');
    navigator.clipboard.writeText(profileUrl).then(function() {
        showSuccess("Profile link copied to clipboard!");
    }).catch(function() {
        var textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess("Profile link copied to clipboard!");
    });
}

function refreshAIInsights() {
    var insights = [
        { trend: "AI/ML skills demand up 127%", salary: "Your skills: \u20B912-18 LPA range", next: "Learn React.js for +40% salary" },
        { trend: "Blockchain dev jobs up 89%", salary: "Your skills: \u20B915-25 LPA range", next: "Add Solidity for +60% salary" },
        { trend: "Full-stack demand up 95%", salary: "Your skills: \u20B910-16 LPA range", next: "Learn AWS for +35% salary" }
    ];

    var randomInsight = insights[Math.floor(Math.random() * insights.length)];

    document.getElementById('aiCareerInsights').innerHTML =
        '<div class="bg-orange-50 p-3 rounded-lg"><div class="font-semibold text-orange-800">Market Trend</div><div class="text-orange-600">' + randomInsight.trend + '</div></div>' +
        '<div class="bg-green-50 p-3 rounded-lg"><div class="font-semibold text-green-800">Salary Potential</div><div class="text-green-600">' + randomInsight.salary + '</div></div>' +
        '<div class="bg-blue-50 p-3 rounded-lg"><div class="font-semibold text-blue-800">Next Step</div><div class="text-blue-600">' + randomInsight.next + '</div></div>';

    showSuccess("AI insights refreshed with latest market data!");
}

// Verification Path Functions
function selectVerificationPath(pathType) {
    selectedVerificationPath = pathType;
    document.querySelector('.max-w-6xl.mx-auto.mb-12').style.display = 'none';

    if (pathType === 'aitest') {
        document.getElementById('aitestFlow').classList.remove('hidden');
    } else if (pathType === 'certificate') {
        document.getElementById('certificateFlow').classList.remove('hidden');
    }

    document.getElementById('backToSelection').classList.remove('hidden');
}

function showVerificationSelection() {
    document.getElementById('aitestFlow').classList.add('hidden');
    document.getElementById('certificateFlow').classList.add('hidden');
    document.getElementById('backToSelection').classList.add('hidden');
    document.querySelector('.max-w-6xl.mx-auto.mb-12').style.display = 'block';
    selectedVerificationPath = null;
}

function startAITestPath() {
    if (!currentUser) {
        showSuccess("Please login first to take the AI assessment.");
        showModal('loginModal');
        return;
    }
    if (!selectedSpecificSkill) {
        showSuccess("Please select a skill first from the Skills page.");
        showPage('skillsPage');
        return;
    }

    currentQuestion = 0;
    testAnswers = [];

    currentUser.currentTest = {
        category: selectedSkillCategory,
        skill: selectedSpecificSkill,
        questions: generateTestQuestions(selectedSkillCategory, selectedSpecificSkill),
        path: 'aitest'
    };

    showModal('testModal');
    loadTestQuestion();
    showSuccess('Starting AI assessment for ' + selectedSpecificSkill + '. Good luck!');
}

function startCertificatePath() {
    if (!currentUser) {
        showSuccess("Please login first to upload certificates.");
        showModal('loginModal');
        return;
    }

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.multiple = true;
    fileInput.onchange = function(e) {
        var files = Array.from(e.target.files);
        if (files.length > 0) {
            processCertificateUpload(files);
        }
    };
    fileInput.click();
}

function processCertificateUpload(files) {
    document.getElementById('cert-progress1').style.width = '100%';
    document.getElementById('cert-step2').classList.remove('bg-gray-300', 'text-gray-600');
    document.getElementById('cert-step2').classList.add('bg-blue-500', 'text-white');

    showSuccess(files.length + ' certificate(s) uploaded successfully! Processing mentor verification...');

    var certificateCurrentStep = document.getElementById('certificateCurrentStep');
    certificateCurrentStep.innerHTML =
        '<h4 class="text-lg font-semibold mb-4 text-green-800">Certificates Uploaded</h4>' +
        '<div class="space-y-3">' +
            files.map(function(file) {
                return '<div class="bg-green-50 p-3 rounded-lg flex items-center justify-between">' +
                    '<div class="flex items-center space-x-3">' +
                        '<span class="text-green-600">&#x1F4C4;</span>' +
                        '<div>' +
                            '<div class="font-semibold text-green-800">' + file.name + '</div>' +
                            '<div class="text-sm text-green-600">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</div>' +
                        '</div>' +
                    '</div>' +
                    '<span class="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">Uploaded</span>' +
                '</div>';
            }).join('') +
        '</div>' +
        '<div class="mt-4 bg-blue-50 p-4 rounded-lg">' +
            '<div class="flex items-center space-x-2 mb-2">' +
                '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>' +
                '<span class="text-blue-800 font-semibold">Mentor Review in Progress...</span>' +
            '</div>' +
            '<p class="text-blue-600 text-sm">Our industry experts are validating your certificates. This usually takes 12-24 hours.</p>' +
        '</div>';

    setTimeout(function() {
        completeCertificateVerification(files);
    }, 5000);
}

function completeCertificateVerification(files) {
    document.getElementById('cert-progress2').style.width = '100%';
    document.getElementById('cert-step3').classList.remove('bg-gray-300', 'text-gray-600');
    document.getElementById('cert-step3').classList.add('bg-purple-500', 'text-white');

    var fileName = files[0].name.toLowerCase();
    var detectedSkill = 'General Skill';
    var verificationScore = 95 + Math.floor(Math.random() * 5);
    var certificateSource = 'Unknown Platform';

    if (fileName.indexOf('javascript') !== -1 || fileName.indexOf('js') !== -1) {
        detectedSkill = 'JavaScript Programming';
        certificateSource = fileName.indexOf('coursera') !== -1 ? 'Coursera' : fileName.indexOf('udemy') !== -1 ? 'Udemy' : 'External Platform';
    } else if (fileName.indexOf('react') !== -1) {
        detectedSkill = 'React Framework';
        certificateSource = fileName.indexOf('coursera') !== -1 ? 'Coursera' : fileName.indexOf('udemy') !== -1 ? 'Udemy' : 'External Platform';
    } else if (fileName.indexOf('python') !== -1) {
        detectedSkill = 'Python Programming';
        certificateSource = fileName.indexOf('coursera') !== -1 ? 'Coursera' : fileName.indexOf('google') !== -1 ? 'Google Certificates' : 'External Platform';
    } else if (fileName.indexOf('aws') !== -1) {
        detectedSkill = 'AWS Cloud';
        certificateSource = 'AWS Certifications';
    } else if (fileName.indexOf('google') !== -1) {
        detectedSkill = 'Google Analytics';
        certificateSource = 'Google Certificates';
    }

    var completedSkill = {
        category: 'tech',
        skill: detectedSkill,
        score: verificationScore,
        completedDate: new Date().toISOString(),
        nftMinted: false,
        verificationType: 'certificate',
        certificateSource: certificateSource,
        certificateFiles: files.map(function(f) { return f.name; }),
        mentorVerified: true,
        trustScore: verificationScore
    };

    userSkillProgress.completed.push(completedSkill);
    userSkillProgress.scores[detectedSkill] = verificationScore;

    if (currentUser) {
        currentUser.skillProgress = userSkillProgress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    updateProgressDashboard();

    var certificateCurrentStep = document.getElementById('certificateCurrentStep');
    certificateCurrentStep.innerHTML =
        '<h4 class="text-lg font-semibold mb-4 text-purple-800">Verification Complete!</h4>' +
        '<div class="bg-purple-50 p-4 rounded-lg mb-4">' +
            '<div class="flex items-center space-x-2 mb-3">' +
                '<span class="text-purple-600 text-2xl">&#x2705;</span>' +
                '<div>' +
                    '<div class="font-semibold text-purple-800">Mentor Approved</div>' +
                    '<div class="text-sm text-purple-600">Certificate verified by industry expert</div>' +
                '</div>' +
            '</div>' +
            '<div class="space-y-2 text-sm">' +
                '<div class="flex justify-between"><span class="text-purple-700">Detected Skill:</span><span class="font-semibold text-purple-800">' + detectedSkill + '</span></div>' +
                '<div class="flex justify-between"><span class="text-purple-700">Source Platform:</span><span class="font-semibold text-purple-800">' + certificateSource + '</span></div>' +
                '<div class="flex justify-between"><span class="text-purple-700">Verification Score:</span><span class="font-semibold text-purple-800">' + verificationScore + '%</span></div>' +
                '<div class="flex justify-between"><span class="text-purple-700">Trust Score:</span><span class="font-semibold text-purple-800">' + verificationScore + '/100</span></div>' +
            '</div>' +
        '</div>' +
        '<button onclick="mintEnhancedNFT(\'' + detectedSkill.replace(/'/g, "\\'") + '\', ' + verificationScore + ', \'' + certificateSource.replace(/'/g, "\\'") + '\')" class="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors">Mint Enhanced NFT Badge</button>';

    showSuccess('Certificate verification complete! Your ' + detectedSkill + ' skill has been verified with ' + verificationScore + '% score. Ready to mint enhanced NFT!');
}

function mintEnhancedNFT(skillName, score, certificateSource) {
    var newNFT = {
        id: Date.now(),
        skill: skillName,
        category: 'tech',
        level: score >= 95 ? "Expert" : score >= 90 ? "Advanced" : "Verified",
        score: score,
        mintDate: new Date().toLocaleDateString(),
        tokenId: "0x" + Math.random().toString(16).substr(2, 8),
        image: "\uD83C\uDFC6",
        trustScore: score,
        verificationType: 'certificate',
        certificateSource: certificateSource,
        enhanced: true,
        badges: ['Certificate Verified', 'Mentor Approved', 'Premium NFT']
    };

    userNFTs.push(newNFT);

    var completedSkill = userSkillProgress.completed.find(function(s) { return s.skill === skillName; });
    if (completedSkill) {
        completedSkill.nftMinted = true;
        completedSkill.nftId = newNFT.id;
    }

    if (currentUser) {
        currentUser.nfts = userNFTs;
        currentUser.skillProgress = userSkillProgress;
        localStorage.setItem('skillchain_user', JSON.stringify(currentUser));
    }

    updateNFTGallery();
    updateProgressDashboard();
    showSuccess('Enhanced NFT Badge minted successfully! Your ' + skillName + ' certificate from ' + certificateSource + ' is now blockchain verified.');

    setTimeout(function() {
        showPage('nftPage');
    }, 2000);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
