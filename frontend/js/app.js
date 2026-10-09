// ======================================================
// GYMBUDDY AI - MAIN JAVASCRIPT
// ======================================================

const API_URL = "https://gymbuddy-ai-production.up.railway.app";


// ======================================================
// HELPER: GET LOGGED-IN USER ID
// ======================================================

function getUserId() {
    return localStorage.getItem("user_id");
}


function validateRegistration(email, age) {
    const cleanEmail = email.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const numericAge = Number(age);

    if (!Number.isInteger(numericAge) || numericAge < 13) {
        alert("You must be at least 13 years old to register.");
        return false;
    }

    if (!emailPattern.test(cleanEmail)) {
        alert("Please enter a valid email address.");
        return false;
    }

    const domain = cleanEmail.split("@").pop();

    if (!domain.toLowerCase().endsWith(".com")) {
        alert("Your email address must end with .com.");
        return false;
    }

    return true;
}

// ======================================================
// HELPER: SAFE JSON RESPONSE
// ======================================================

async function getResponseData(response) {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}


// ======================================================
// REQUIRE LOGIN
// ======================================================

// ======================================================
// REQUIRE LOGIN
// ======================================================

function requireLogin() {

    const userId = getUserId();

    if (!userId) {
        window.location.href = "login.html";
        return false;
    }

    // Load dashboard information
    if (document.getElementById("userInfo")) {
        loadDashboard();
    }

    return true;
}


// ======================================================
// LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("LOGIN FORM SUBMITTED");

        const emailInput =
            document.getElementById("loginEmail");

        const passwordInput =
            document.getElementById("loginPassword");

        const loginMessage =
            document.getElementById("loginMessage");

        if (!emailInput || !passwordInput) {
            console.error("Login inputs not found.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {

            if (loginMessage) {
                loginMessage.innerText =
                    "Please enter your email and password.";
            }

            return;
        }

        const loginData = {
            email: email,
            password: password
        };

        console.log("Sending login request:", {
            email: email
        });

        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(loginData)
                }
            );

            const data =
                await getResponseData(response);

            console.log(
                "Login status:",
                response.status
            );

            console.log(
                "Login response:",
                data
            );

            if (response.ok) {

                if (!data.user_id) {

                    if (loginMessage) {
                        loginMessage.innerText =
                            "Login succeeded, but user information was not returned.";
                    }

                    return;
                }

                localStorage.setItem(
                    "user_id",
                    String(data.user_id)
                );

                localStorage.setItem(
                    "user_name",
                    data.name || ""
                );

                localStorage.setItem(
                    "user_email",
                    data.email || email
                );

                console.log(
                    "Logged in user:",
                    data.user_id
                );

                window.location.href =
                    "dashboard.html";

            } else {

                if (loginMessage) {

                    loginMessage.innerText =
                        data.detail ||
                        "Invalid email or password.";

                } else {

                    alert(
                        data.detail ||
                        "Invalid email or password."
                    );
                }
            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            if (loginMessage) {

                loginMessage.innerText =
                    "Unable to connect to GymBuddy AI server.";

            } else {

                alert(
                    "Unable to connect to GymBuddy AI server."
                );
            }
        }
    });
}


// ======================================================
// REGISTER
// ======================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;


            const age = parseInt(
                document.getElementById("age").value,
                10
            );

if (!validateRegistration(email, age)) {
    return;
}


            const fitnessGoalElement =
                document.getElementById("fitness_goal");

            const experienceElement =
                document.getElementById("experience_level");

            const user = {

                name: name,

                email: email,

                password: password,

                age: age,

                fitness_goal:
                    fitnessGoalElement
                        ? fitnessGoalElement.value
                        : null,

                experience_level:
                    experienceElement
                        ? experienceElement.value
                        : null
            };

            console.log("Registering user:", {
    name: user.name,
    email: user.email
});

            try {

                const response =
                    await fetch("https://gymbuddy-ai-production.up.railway.app/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        // Keep your existing registration fields here.
    })
});

                const data =
                    await getResponseData(response);

                if (response.ok) {

                    localStorage.setItem(
                        "user_id",
                        String(data.user_id)
                    );

                    localStorage.setItem(
                        "user_name",
                        data.name || name
                    );

                    localStorage.setItem(
                        "user_email",
                        data.email || email
                    );

                    alert(
                        "Account created successfully!"
                    );

                    window.location.href =
                        "profile.html";

                } else {

                    alert(
                        data.detail ||
                        "Registration failed."
                    );
                }

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Unable to connect to GymBuddy AI server."
                );
            }
        }
    );
}


// ======================================================
// CREATE FITNESS PROFILE
// ======================================================

const profileForm =
    document.getElementById("profileForm");

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!requireLogin()) {
                return;
            }

            const userId = getUserId();

            const profile = {

                user_id:
                    parseInt(userId),

                fitness_goal:
                document.getElementById(
                    "fitness_goal"
                ).value,

                experience_level:
                document.getElementById(
                    "experience_level"
                ).value,

                workout_type:
                document.getElementById(
                    "workout_type"
                ).value,

                intensity:
                document.getElementById(
                    "intensity"
                ).value,

                workout_frequency:
                    parseInt(
                        document.getElementById(
                            "workout_frequency"
                        ).value
                    )
            };

            console.log(
                "Creating fitness profile:",
                profile
            );

            try {

                const response =
                    await fetch(
                        `${API_URL}/profiles`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(profile)
                        }
                    );

                const data =
                    await getResponseData(response);

                if (response.ok) {

                    alert(
                        "Fitness profile saved successfully!"
                    );

                    window.location.href =
                        "preferences.html";

                } else {

                    alert(
                        data.detail ||
                        "Unable to save fitness profile."
                    );
                }

            } catch (error) {

                console.error(
                    "Profile error:",
                    error
                );

                alert(
                    "Unable to connect to GymBuddy AI server."
                );
            }
        }
    );
}


// ======================================================
// CREATE WORKOUT PREFERENCES
// ======================================================

const preferencesForm =
    document.getElementById("preferencesForm");

if (preferencesForm) {

    preferencesForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!requireLogin()) {
                return;
            }

            const userId = getUserId();

            const preferences = {

                user_id:
                    parseInt(userId),

                preferred_workout:
                document.getElementById(
                    "preferred_workout"
                ).value,

                preferred_intensity:
                document.getElementById(
                    "preferred_intensity"
                ).value,

                preferred_duration:
                    parseInt(
                        document.getElementById(
                            "preferred_duration"
                        ).value
                    ),

                preferred_location:
                document.getElementById(
                    "preferred_location"
                ).value,

                partner_preference:
                document.getElementById(
                    "partner_preference"
                ).value
            };

            console.log(
                "Creating preferences:",
                preferences
            );

            try {

                const response =
                    await fetch(
                        `${API_URL}/preferences`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    preferences
                                )
                        }
                    );

                const data =
                    await getResponseData(response);

                if (response.ok) {

                    alert(
                        "Workout preferences saved successfully!"
                    );

                    window.location.href =
                        "schedule.html";

                } else {

                    alert(
                        data.detail ||
                        "Unable to save preferences."
                    );
                }

            } catch (error) {

                console.error(
                    "Preferences error:",
                    error
                );

                alert(
                    "Unable to connect to GymBuddy AI server."
                );
            }
        }
    );
}


// ======================================================
// CREATE WORKOUT SCHEDULE
// ======================================================

const scheduleForm =
    document.getElementById("scheduleForm");

if (scheduleForm) {

    scheduleForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!requireLogin()) {
                return;
            }

            const userId = getUserId();

            const day =
                document.getElementById("day").value;

            const startTime =
                document.getElementById("start_time").value;

            const endTime =
                document.getElementById("end_time").value;

            if (!day || !startTime || !endTime) {

                alert(
                    "Please complete all schedule fields."
                );

                return;
            }

            if (startTime >= endTime) {

                alert(
                    "End time must be later than start time."
                );

                return;
            }

            const schedule = {

                user_id:
                    parseInt(userId),

                day:
                day,

                start_time:
                startTime,

                end_time:
                endTime
            };

            try {

                const response =
                    await fetch(
                        `${API_URL}/schedules`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(schedule)
                        }
                    );

                const data =
                    await getResponseData(response);

                if (response.ok) {

                    alert(
                        "Workout schedule saved successfully!"
                    );

                    scheduleForm.reset();

                    if (
                        typeof loadSchedules ===
                        "function"
                    ) {
                        loadSchedules();
                    }

                } else {

                    alert(
                        data.detail ||
                        "Unable to save schedule."
                    );
                }

            } catch (error) {

                console.error(
                    "Schedule error:",
                    error
                );

                alert(
                    "Unable to connect to GymBuddy AI server."
                );
            }
        }
    );
}


// ======================================================
// LOAD SCHEDULES
// ======================================================

async function loadSchedules() {

    const userId = getUserId();

    const scheduleContainer =
        document.getElementById(
            "dashboardSchedule"
        );

    if (!userId || !scheduleContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/schedules/${userId}`
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            scheduleContainer.innerHTML =
                "<p>Unable to load schedule.</p>";

            return;
        }

        if (!data || data.length === 0) {

            scheduleContainer.innerHTML =
                "<p>No workout schedule added yet.</p>";

            return;
        }

        scheduleContainer.innerHTML =
            data.map(function (schedule) {

                return `
                    <div class="schedule-item">

                        <p>
                            <strong>
                                ${schedule.day}
                            </strong>
                        </p>

                        <p>
                            ${formatTime(schedule.start_time)}
                            -
                            ${formatTime(schedule.end_time)}
                        </p>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Load schedules error:",
            error
        );

        scheduleContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "";
    }

    const parts =
        timeValue.split(":");

    if (parts.length < 2) {
        return timeValue;
    }

    let hour =
        parseInt(parts[0]);

    const minute =
        parts[1];

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
}


// ======================================================
// EDIT SCHEDULE
// ======================================================

function editSchedule(
    scheduleId,
    day,
    startTime,
    endTime
) {

    const modal =
        document.getElementById(
            "editScheduleModal"
        );

    const idInput =
        document.getElementById(
            "editScheduleId"
        );

    const dayInput =
        document.getElementById(
            "editScheduleDay"
        );

    const startInput =
        document.getElementById(
            "editStartTime"
        );

    const endInput =
        document.getElementById(
            "editEndTime"
        );

    const message =
        document.getElementById(
            "editScheduleMessage"
        );

    if (!modal) {

        console.error(
            "Edit schedule modal not found."
        );

        return;
    }

    if (idInput) {
        idInput.value = scheduleId;
    }

    if (dayInput) {
        dayInput.value = day;
    }

    if (startInput) {
        startInput.value =
            String(startTime).substring(0, 5);
    }

    if (endInput) {
        endInput.value =
            String(endTime).substring(0, 5);
    }

    if (message) {
        message.innerText = "";
    }

    modal.style.display = "flex";
}


// ======================================================
// CLOSE SCHEDULE EDITOR
// ======================================================

function closeScheduleEditor() {

    const modal =
        document.getElementById(
            "editScheduleModal"
        );

    if (modal) {
        modal.style.display = "none";
    }

    const form =
        document.getElementById(
            "editScheduleForm"
        );

    if (form) {
        form.reset();
    }

    const message =
        document.getElementById(
            "editScheduleMessage"
        );

    if (message) {
        message.textContent = "";
    }
}

// ======================================================
// EDIT / ADD WORKOUT SCHEDULE
// ======================================================

const editScheduleForm =
    document.getElementById("editScheduleForm");

if (editScheduleForm) {

    editScheduleForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const scheduleId =
                document.getElementById(
                    "editScheduleId"
                ).value;

            const userId =
                getUserId();

            const day =
                document.getElementById(
                    "editScheduleDay"
                ).value;

            const startTime =
                document.getElementById(
                    "editStartTime"
                ).value;

            const endTime =
                document.getElementById(
                    "editEndTime"
                ).value;

            const message =
                document.getElementById(
                    "editScheduleMessage"
                );

            // ==========================================
            // VALIDATION
            // ==========================================

            if (!userId) {

                if (message) {
                    message.textContent =
                        "User information is missing.";
                }

                return;
            }

            if (!day || !startTime || !endTime) {

                if (message) {
                    message.textContent =
                        "Please complete all schedule fields.";
                }

                return;
            }

            if (startTime >= endTime) {

                if (message) {
                    message.textContent =
                        "End time must be later than start time.";
                }

                return;
            }

            const scheduleData = {

                user_id:
                    parseInt(userId),

                day:
                    day,

                start_time:
                    startTime,

                end_time:
                    endTime

            };

            try {

                let response;

                // ==========================================
                // NEW SCHEDULE
                // ==========================================

                if (!scheduleId) {

                    response = await fetch(
                        `${API_URL}/schedules`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    scheduleData
                                )
                        }
                    );

                }

                // ==========================================
                // UPDATE EXISTING SCHEDULE
                // ==========================================

                else {

                    response = await fetch(
                        `${API_URL}/schedules/${scheduleId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    scheduleData
                                )
                        }
                    );

                }

                const data =
                    await getResponseData(response);

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to save workout schedule."
                    );

                }

                // ==========================================
                // SUCCESS
                // ==========================================

                if (message) {

                    message.textContent =
                        scheduleId
                            ? "Schedule updated successfully!"
                            : "Schedule added successfully!";

                }

                await loadProfileSchedule();

                if (
                    typeof loadSchedules === "function"
                ) {
                    await loadSchedules();
                }

                setTimeout(() => {

                    closeScheduleEditor();

                }, 700);

            } catch (error) {

                console.error(
                    "Schedule save error:",
                    error
                );

                if (message) {

                    message.textContent =
                        error.message ||
                        "Failed to save workout schedule.";

                }

            }

        }
    );
}


// ======================================================
// EDIT FITNESS PROFILE
// ======================================================

async function openFitnessEditor() {

    if (!requireLogin()) {
        return;
    }

    const userId = getUserId();

    const modal =
        document.getElementById("editFitnessModal");

    const message =
        document.getElementById("editFitnessMessage");

    if (!userId) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/profiles/${userId}`
        );

        const profile =
            await getResponseData(response);

        console.log("Fitness profile:", profile);

        if (response.ok) {

            document.getElementById("editFitnessGoal").value =
                profile.fitness_goal || "";

            document.getElementById("editExperienceLevel").value =
                profile.experience_level || "";

            document.getElementById("editWorkoutType").value =
                profile.workout_type || "";

            document.getElementById("editIntensity").value =
                profile.intensity || "";

            document.getElementById("editWorkoutFrequency").value =
                profile.workout_frequency || "";

        } else if (response.status === 404) {

            // New account has no profile yet.
            // Leave the fields blank so the user can create it.

            document.getElementById("editFitnessGoal").value = "";
            document.getElementById("editExperienceLevel").value = "";
            document.getElementById("editWorkoutType").value = "";
            document.getElementById("editIntensity").value = "";
            document.getElementById("editWorkoutFrequency").value = "";

            console.log(
                "No fitness profile yet. A new one will be created when saved."
            );

        } else {

            if (message) {
                message.innerText =
                    profile.detail ||
                    "Unable to load fitness profile.";
            }
        }

        if (modal) {
            modal.style.display = "flex";
        }

    } catch (error) {

        console.error(
            "Error loading fitness profile:",
            error
        );

        if (message) {
            message.innerText =
                "Unable to connect to server.";
        }
    }
}

// ======================================================
// CLOSE FITNESS EDITOR
// ======================================================

function closeFitnessEditor() {

    const modal =
        document.getElementById(
            "editFitnessModal"
        );

    if (modal) {
        modal.style.display = "none";
    }
}


// ======================================================
// UPDATE FITNESS PROFILE
// ======================================================

const editFitnessForm =
    document.getElementById("editFitnessForm");

if (editFitnessForm) {

    editFitnessForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log(
                "Fitness profile Save button clicked."
            );

            const userId = getUserId();

            const message =
                document.getElementById(
                    "editFitnessMessage"
                );

            if (!userId) {

                if (message) {
                    message.innerText =
                        "Please log in again.";
                }

                return;
            }

            const fitnessGoal =
                document.getElementById(
                    "editFitnessGoal"
                ).value;

            const experienceLevel =
                document.getElementById(
                    "editExperienceLevel"
                ).value;

            const workoutType =
                document.getElementById(
                    "editWorkoutType"
                ).value;

            const intensity =
                document.getElementById(
                    "editIntensity"
                ).value;

            const frequency =
                parseInt(
                    document.getElementById(
                        "editWorkoutFrequency"
                    ).value
                );

            if (
                !fitnessGoal ||
                !experienceLevel ||
                !workoutType ||
                !intensity ||
                isNaN(frequency)
            ) {

                if (message) {
                    message.innerText =
                        "Please complete all fitness profile fields.";
                }

                return;
            }

            const updatedProfile = {

                user_id: parseInt(userId),

                fitness_goal:
                    fitnessGoal,

                experience_level:
                    experienceLevel,

                workout_type:
                    workoutType,

                intensity:
                    intensity,

                workout_frequency:
                    frequency
            };

            console.log(
                "Sending fitness profile:",
                updatedProfile
            );

            try {

                const response = await fetch(
                    `${API_URL}/profiles/${userId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                updatedProfile
                            )
                    }
                );

                const data =
                    await getResponseData(response);

                console.log(
                    "Fitness save status:",
                    response.status
                );

                console.log(
                    "Fitness save response:",
                    data
                );

                if (response.ok) {

                    if (message) {
                        message.innerText =
                            "Fitness profile saved successfully!";
                    }

                    alert(
                        "Fitness profile saved successfully!"
                    );

                    closeFitnessEditor();

                    await loadMyProfile();

                } else {

                    if (message) {
                        message.innerText =
                            data.detail ||
                            "Unable to save fitness profile.";
                    }

                    console.error(
                        "Fitness save failed:",
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Fitness save error:",
                    error
                );

                if (message) {
                    message.innerText =
                        "Unable to connect to GymBuddy AI server.";
                }
            }
        }
    );
}


// ======================================================
// EDIT WORKOUT PREFERENCES
// ======================================================

async function openPreferenceEditor() {

    if (!requireLogin()) {
        return;
    }

    const userId = getUserId();

    const modal =
        document.getElementById(
            "editPreferenceModal"
        );

    const message =
        document.getElementById(
            "editPreferenceMessage"
        );

    try {

        const response = await fetch(
            `${API_URL}/preferences/${userId}`
        );

        const preference =
            await getResponseData(response);

        console.log(
            "Workout preferences:",
            preference
        );

        if (response.ok) {

            document.getElementById(
                "editPreferredWorkout"
            ).value =
                preference.preferred_workout || "";

            document.getElementById(
                "editPreferredIntensity"
            ).value =
                preference.preferred_intensity || "";

            document.getElementById(
                "editPreferredDuration"
            ).value =
                preference.preferred_duration || "";

            document.getElementById(
                "editPreferredLocation"
            ).value =
                preference.preferred_location || "";

            document.getElementById(
                "editPartnerPreference"
            ).value =
                preference.partner_preference || "";

        } else if (response.status === 404) {

            // New account — no preferences yet.
            document.getElementById(
                "editPreferredWorkout"
            ).value = "";

            document.getElementById(
                "editPreferredIntensity"
            ).value = "";

            document.getElementById(
                "editPreferredDuration"
            ).value = "";

            document.getElementById(
                "editPreferredLocation"
            ).value = "";

            document.getElementById(
                "editPartnerPreference"
            ).value = "";

            console.log(
                "No preferences yet. They will be created when saved."
            );

        } else {

            if (message) {
                message.innerText =
                    preference.detail ||
                    "Unable to load preferences.";
            }
        }

        if (modal) {
            modal.style.display = "flex";
        }

    } catch (error) {

        console.error(
            "Error loading preferences:",
            error
        );

        if (message) {
            message.innerText =
                "Unable to connect to server.";
        }
    }
}


function closePreferenceEditor() {
    const modal = document.getElementById("editPreferenceModal");

    if (modal) {
        modal.style.display = "none";
    }

    const form = document.getElementById("editPreferenceForm");

    if (form) {
        form.reset();
    }

    const message = document.getElementById("editPreferenceMessage");

    if (message) {
        message.textContent = "";
    }
}

// ======================================================
// UPDATE WORKOUT PREFERENCES
// ======================================================

const editPreferenceForm =
    document.getElementById(
        "editPreferenceForm"
    );

if (editPreferenceForm) {

    editPreferenceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log(
                "Preference Save button clicked."
            );

            const userId =
                getUserId();

            const message =
                document.getElementById(
                    "editPreferenceMessage"
                );

            if (!userId) {

                if (message) {
                    message.innerText =
                        "Please log in again.";
                }

                return;
            }

            const duration =
                parseInt(
                    document.getElementById(
                        "editPreferredDuration"
                    ).value
                );

            const updatedPreference = {

                user_id:
                    parseInt(userId),

                preferred_workout:
                document.getElementById(
                    "editPreferredWorkout"
                ).value,

                preferred_intensity:
                document.getElementById(
                    "editPreferredIntensity"
                ).value,

                preferred_duration:
                duration,

                preferred_location:
                document.getElementById(
                    "editPreferredLocation"
                ).value,

                partner_preference:
                document.getElementById(
                    "editPartnerPreference"
                ).value
            };

            if (
                !updatedPreference.preferred_workout ||
                !updatedPreference.preferred_intensity ||
                isNaN(duration) ||
                !updatedPreference.preferred_location ||
                !updatedPreference.partner_preference
            ) {

                if (message) {
                    message.innerText =
                        "Please complete all workout preference fields.";
                }

                return;
            }

            console.log(
                "Sending preference update:",
                updatedPreference
            );

            try {

                const response =
                    await fetch(
                        `${API_URL}/preferences/${userId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    updatedPreference
                                )
                        }
                    );

                const data =
                    await getResponseData(response);

                console.log(
                    "Preference update status:",
                    response.status
                );

                console.log(
                    "Preference update response:",
                    data
                );

                if (response.ok) {

                    alert(
                        "Workout preferences updated successfully!"
                    );

                    closePreferenceEditor();

                    if (
                        typeof loadMyProfile ===
                        "function"
                    ) {
                        await loadMyProfile();
                    }

                } else {

                    if (message) {
                        message.innerText =
                            data.detail ||
                            "Unable to update workout preferences.";
                    }
                }

            } catch (error) {

                console.error(
                    "Preference update error:",
                    error
                );

                if (message) {
                    message.innerText =
                        "Unable to connect to server.";
                }
            }
        }
    );
}


// ======================================================
// LOAD USER PROFILE
// ======================================================

async function loadMyProfile() {

    const userId =
        getUserId();

    if (!userId) {
        return;
    }

    try {

        const userResponse =
            await fetch(
                `${API_URL}/users/${userId}`
            );

        const user =
            await getResponseData(
                userResponse
            );

        if (userResponse.ok) {

            const nameElement =
                document.getElementById(
                    "profileName"
                );

            const emailElement =
                document.getElementById(
                    "profileEmail"
                );

            const ageElement =
                document.getElementById(
                    "profileAge"
                );

            if (nameElement) {
                nameElement.innerText =
                    user.name || "";
            }

            if (emailElement) {
                emailElement.innerText =
                    user.email || "";
            }

            if (ageElement) {
                ageElement.innerText =
                    user.age || "";
            }
        }

        await loadProfileFitness(userId);

        await loadProfilePreferences(userId);

        await loadProfileSchedule(userId);

    } catch (error) {

        console.error(
            "Load profile error:",
            error
        );
    }
}


// ======================================================
// LOAD FITNESS PROFILE
// ======================================================

async function loadProfileFitness(userId) {

    const container =
        document.getElementById(
            "profileFitnessInfo"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/profiles/${userId}`
            );

        const profile =
            await getResponseData(response);

        if (!response.ok) {

            container.innerHTML =
                "<p>No fitness profile yet.</p>";

            return;
        }

        container.innerHTML = `
            <p>
                <strong>Fitness Goal:</strong>
                ${profile.fitness_goal || "Not set"}
            </p>

            <p>
                <strong>Experience Level:</strong>
                ${profile.experience_level || "Not set"}
            </p>

            <p>
                <strong>Workout Type:</strong>
                ${profile.workout_type || "Not set"}
            </p>

            <p>
                <strong>Intensity:</strong>
                ${profile.intensity || "Not set"}
            </p>

            <p>
                <strong>Workout Frequency:</strong>
                ${profile.workout_frequency || "Not set"}
                days/week
            </p>
        `;

    } catch (error) {

        console.error(
            "Load fitness profile error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load fitness profile.</p>";
    }
}


// ======================================================
// LOAD WORKOUT PREFERENCES
// ======================================================

async function loadProfilePreferences(userId) {

    const container =
        document.getElementById(
            "profilePreferenceInfo"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/preferences/${userId}`
            );

        const preference =
            await getResponseData(response);

        if (!response.ok) {

            container.innerHTML =
                "<p>No workout preferences yet.</p>";

            return;
        }

        container.innerHTML = `
            <p>
                <strong>Preferred Workout:</strong>
                ${preference.preferred_workout || "Not set"}
            </p>

            <p>
                <strong>Preferred Intensity:</strong>
                ${preference.preferred_intensity || "Not set"}
            </p>

            <p>
                <strong>Preferred Duration:</strong>
                ${preference.preferred_duration || "Not set"}
                minutes
            </p>

            <p>
                <strong>Preferred Location:</strong>
                ${preference.preferred_location || "Not set"}
            </p>

            <p>
                <strong>Partner Preference:</strong>
                ${preference.partner_preference || "Not set"}
            </p>
        `;

    } catch (error) {

        console.error(
            "Load preferences error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load workout preferences.</p>";
    }
}

// ======================================================
// LOAD PROFILE SCHEDULE
// ======================================================

// ======================================================
// LOAD PROFILE SCHEDULE
// ======================================================

async function loadProfileSchedule() {

    const userId = getUserId();

    const container =
        document.getElementById("profileSchedule");

    if (!userId || !container) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/schedules/${userId}`
        );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to load schedule."
            );
        }

        if (!Array.isArray(data) || data.length === 0) {

            container.innerHTML = `
                <p>
                    No workout schedule added yet.
                </p>
            `;

            return;
        }

        container.innerHTML = data.map(schedule => `

            <div
                class="schedule-item"
                data-schedule-id="${schedule.schedule_id}"
                data-day="${schedule.day}"
                data-start-time="${schedule.start_time}"
                data-end-time="${schedule.end_time}"
            >

                <div class="schedule-info">

                    <strong>
                        ${schedule.day}
                    </strong>

                    <span>
                        ${formatTime(schedule.start_time)}
                        -
                        ${formatTime(schedule.end_time)}
                    </span>

                </div>

            </div>

        `).join("");

    } catch (error) {

        console.error(
            "Error loading profile schedule:",
            error
        );

        container.innerHTML = `
            <p>
                Unable to load workout schedule.
            </p>
        `;
    }
}

// ======================================================
// OPEN SCHEDULE EDITOR FROM PROFILE
// ======================================================

async function openScheduleEditorFromProfile() {

    const userId = getUserId();

    if (!userId) {
        return;
    }

    const modal =
        document.getElementById("editScheduleModal");

    if (!modal) {
        console.error(
            "Edit schedule modal not found."
        );
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/schedules/${userId}`
        );

        const data =
            await getResponseData(response);

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Failed to load schedule."
            );
        }

        // ==========================================
        // NEW USER - NO SCHEDULE YET
        // ==========================================

        if (!Array.isArray(data) || data.length === 0) {

            document.getElementById(
                "editScheduleId"
            ).value = "";

            document.getElementById(
                "editScheduleDay"
            ).value = "";

            document.getElementById(
                "editStartTime"
            ).value = "";

            document.getElementById(
                "editEndTime"
            ).value = "";

            const message =
                document.getElementById(
                    "editScheduleMessage"
                );

            if (message) {
                message.textContent =
                    "Add your first workout schedule.";
            }

            modal.style.display = "flex";

            return;
        }

        // ==========================================
        // EXISTING USER - LOAD FIRST SCHEDULE
        // ==========================================

        const schedule = data[0];

        openScheduleEditor(
            schedule.schedule_id,
            schedule.day,
            schedule.start_time,
            schedule.end_time
        );

    } catch (error) {

        console.error(
            "Error opening schedule editor:",
            error
        );

        alert(
            "Unable to open workout schedule editor."
        );
    }
}

// ======================================================
// OPEN SCHEDULE EDITOR
// ======================================================

function openScheduleEditor(
    scheduleId,
    day,
    startTime,
    endTime
) {
    const modal =
        document.getElementById("editScheduleModal");

    if (!modal) {
        console.error(
            "editScheduleModal not found."
        );
        return;
    }

    document.getElementById("editScheduleId").value =
        scheduleId;

    document.getElementById("editScheduleDay").value =
        day;

    document.getElementById("editStartTime").value =
        startTime.substring(0, 5);

    document.getElementById("editEndTime").value =
        endTime.substring(0, 5);

    modal.style.display = "flex";
}

// ======================================================
// LOAD PROFILE PAGE
// ======================================================

if (
    document.getElementById(
        "profileFitnessInfo"
    ) ||
    document.getElementById(
        "profilePreferenceInfo"
    ) ||
    document.getElementById(
        "profileSchedule"
    )
) {

    if (getUserId()) {
        loadMyProfile();
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem("user_id");

    localStorage.removeItem("user_name");

    localStorage.removeItem("user_email");

    window.location.href =
        "login.html";
}


// ===============================
// LOAD DASHBOARD INFORMATION
// ===============================

async function loadDashboard() {

    const userId = getUserId();

    if (!userId) {
        console.log("No user ID found.");
        return;
    }

    console.log("Loading dashboard for user:", userId);

    try {

        // ===============================
        // LOAD USER INFORMATION
        // ===============================

        const userResponse = await fetch(
            `${API_URL}/users/${userId}`
        );

        if (!userResponse.ok) {
            throw new Error("Failed to load user information.");
        }

        const user = await userResponse.json();

        console.log("User data:", user);

        const userName = document.getElementById("userName");
        const userInfo = document.getElementById("userInfo");

        if (userName) {
            userName.textContent = user.name;
        }

        if (userInfo) {
            userInfo.innerHTML = `
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Age:</strong> ${user.age}</p>
            `;
        }


        // ===============================
        // LOAD FITNESS PROFILE
        // ===============================

        const fitnessResponse = await fetch(
            `${API_URL}/profiles/${userId}`
        );

        const fitnessInfo =
            document.getElementById("fitnessInfo");

        if (fitnessResponse.ok) {

            const fitness = await fitnessResponse.json();

            console.log("Fitness profile:", fitness);

            if (fitnessInfo) {
                fitnessInfo.innerHTML = `
                    <p>
                        <strong>Fitness Goal:</strong>
                        ${fitness.fitness_goal || "Not set"}
                    </p>

                    <p>
                        <strong>Experience Level:</strong>
                        ${fitness.experience_level || "Not set"}
                    </p>

                    <p>
                        <strong>Workout Type:</strong>
                        ${fitness.workout_type || "Not set"}
                    </p>

                    <p>
                        <strong>Intensity:</strong>
                        ${fitness.intensity || "Not set"}
                    </p>

                    <p>
                        <strong>Workout Frequency:</strong>
                        ${fitness.workout_frequency || "Not set"}
                        days/week
                    </p>
                `;
            }

        } else {

            if (fitnessInfo) {
                fitnessInfo.innerHTML = `
                    <p>No fitness profile found.</p>
                `;
            }
        }


        // ===============================
        // LOAD WORKOUT PREFERENCES
        // ===============================

        const preferenceResponse = await fetch(
            `${API_URL}/preferences/${userId}`
        );

        const preferenceInfo =
            document.getElementById("preferenceInfo");

        if (preferenceResponse.ok) {

            const preference =
                await preferenceResponse.json();

            console.log(
                "Workout preferences:",
                preference
            );

            if (preferenceInfo) {
                preferenceInfo.innerHTML = `
                    <p>
                        <strong>Preferred Workout:</strong>
                        ${preference.preferred_workout || "Not set"}
                    </p>

                    <p>
                        <strong>Preferred Intensity:</strong>
                        ${preference.preferred_intensity || "Not set"}
                    </p>

                    <p>
                        <strong>Preferred Duration:</strong>
                        ${preference.preferred_duration || "Not set"}
                        minutes
                    </p>

                    <p>
                        <strong>Preferred Location:</strong>
                        ${preference.preferred_location || "Not set"}
                    </p>

                    <p>
                        <strong>Partner Preference:</strong>
                        ${preference.partner_preference || "Not set"}
                    </p>
                `;
            }

        } else {

            if (preferenceInfo) {
                preferenceInfo.innerHTML = `
                    <p>No workout preferences found.</p>
                `;
            }
        }


        // ===============================
        // LOAD SCHEDULE
        // ===============================

        await loadDashboardSchedule();


        console.log("Dashboard information loaded successfully.");

    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

        const userInfo =
            document.getElementById("userInfo");

        if (userInfo) {
            userInfo.innerHTML = `
                <p>
                    Unable to load user information.
                </p>
            `;
        }
    }
}


// ===============================
// LOAD DASHBOARD SCHEDULE
// ===============================

async function loadDashboardSchedule() {

    const userId = getUserId();

    const scheduleContainer =
        document.getElementById("dashboardSchedule");

    if (!scheduleContainer) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/schedules/${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load schedule.");
        }

        const schedules = await response.json();

        console.log("Schedules:", schedules);

        if (!schedules || schedules.length === 0) {

            scheduleContainer.innerHTML = `
                <p>No workout schedule found.</p>
            `;

            return;
        }

        scheduleContainer.innerHTML = schedules.map(
            schedule => `
                <div class="schedule-item">

                    <p>
                        <strong>Day:</strong>
                        ${schedule.day}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${formatTime(schedule.start_time)}
                        -
                        ${formatTime(schedule.end_time)}
                    </p>

                </div>
            `
        ).join("");

    } catch (error) {

        console.error(
            "Error loading schedule:",
            error
        );

        scheduleContainer.innerHTML = `
            <p>Unable to load schedule.</p>
        `;
    }
}

// ======================================================
// NAVIGATION
// ======================================================

function giveFeedback(partnerId) {

    if (!partnerId) {
        alert("Unable to identify this workout partner.");
        return;
    }

    window.location.href =
        `feedback.html?partner_id=${partnerId}`;
}

function goToDashboard() {
    window.location.href =
        "dashboard.html";
}


function goToRecommendations() {
    window.location.href =
        "recommendations.html";
}


function goToProfile() {
    window.location.href =
        "profile.html";
}


function goToPreferences() {
    window.location.href =
        "preferences.html";
}


function goToSchedule() {
    window.location.href =
        "schedule.html";
}


// ======================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener(
    "click",
    function (event) {

        const fitnessModal =
            document.getElementById(
                "editFitnessModal"
            );

        const preferenceModal =
            document.getElementById(
                "editPreferenceModal"
            );

        const scheduleModal =
            document.getElementById(
                "editScheduleModal"
            );

        if (
            fitnessModal &&
            event.target === fitnessModal
        ) {
            fitnessModal.style.display =
                "none";
        }

        if (
            preferenceModal &&
            event.target === preferenceModal
        ) {
            preferenceModal.style.display =
                "none";
        }

        if (
            scheduleModal &&
            event.target === scheduleModal
        ) {
            scheduleModal.style.display =
                "none";
        }
    }
);


// ======================================================
// APP.JS LOADED CHECK
// ======================================================

console.log(
    "GymBuddy AI app.js loaded successfully."
);

//load recommendations

// ======================================================
// LOAD RECOMMENDATIONS
// ======================================================

async function loadRecommendations() {

    const userId = getUserId();

    const status =
        document.getElementById("recommendationStatus");

    const list =
        document.getElementById("recommendationList");

    if (!userId) {

        if (status) {
            status.innerText =
                "Please log in first.";
        }

        return;
    }

    try {

        if (status) {
            status.innerText =
                "Loading recommendations...";
        }

        const response =
            await fetch(
                `${API_URL}/recommendations/${userId}`
            );

        const data =
            await getResponseData(response);

        console.log(
            "Recommendation response:",
            data
        );

        if (!response.ok) {

            if (status) {
                status.innerText =
                    data.detail ||
                    "Unable to load recommendations.";
            }

            return;
        }

        // ==========================================
        // HANDLE RESPONSE FORMAT
        // ==========================================

        let recommendations = data;

        if (
            data &&
            Array.isArray(data.recommendations)
        ) {
            recommendations =
                data.recommendations;
        }

        if (!Array.isArray(recommendations)) {

            console.error(
                "Unexpected recommendation format:",
                recommendations
            );

            if (status) {
                status.innerText =
                    "Invalid recommendation data received.";
            }

            return;
        }

        // ==========================================
        // NO RECOMMENDATIONS
        // ==========================================

        if (recommendations.length === 0) {

            if (status) {
                status.innerText =
                    "No compatible workout partners found.";
            }

            if (list) {
                list.innerHTML = "";
            }

            return;
        }

        // ==========================================
        // DISPLAY COUNT
        // ==========================================

        if (status) {

            status.innerText =
                `${recommendations.length} workout partner recommendation(s) found.`;
        }

        // ==========================================
        // DISPLAY RECOMMENDATION CARDS
        // ==========================================

        if (list) {

            list.innerHTML =
                recommendations.map(
                    function (recommendation) {

                        const partnerId =
                            recommendation.partner_id ||
                            recommendation.user_id;

                        return `
                            <div class="recommendation-card">

                                <h3>
                                    ${recommendation.partner_name || "Workout Partner"}
                                </h3>

                                <p>
                                    <strong>Similarity Score:</strong>
                                    ${recommendation.similarity_score ?? "N/A"}
                                </p>

                                <p>
                                    <strong>Schedule Score:</strong>
                                    ${recommendation.schedule_score ?? "N/A"}
                                </p>

                                <p>
                                    <strong>Compatibility Score:</strong>
                                    ${recommendation.compatibility_score ?? "N/A"}
                                </p>

                                <p>
                                    ${recommendation.explanation || ""}
                                </p>

                                <button
                                    type="button"
                                    class="feedback-button"
                                    onclick="giveFeedback(${partnerId})"
                                >
                                    ⭐ Give Feedback
                                </button>

                            </div>
                        `;

                    }
                ).join("");
        }

    } catch (error) {

        console.error(
            "Error loading recommendations:",
            error
        );

        if (status) {
            status.innerText =
                "Unable to connect to the recommendation server.";
        }
    }
}

console.log(
    "GymBuddy AI app.js loaded successfully."
);