from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path


from backend.database import engine, get_db
from backend import models
from backend import crud
from backend.services.recommendation import generate_recommendations

from backend.schemas import (
    UserCreate,
    UserResponse,
    FitnessProfileCreate,
    FitnessProfileResponse,
    WorkoutPreferenceCreate,
    WorkoutPreferenceResponse,
    ScheduleCreate,
    ScheduleResponse,
    FeedbackCreate,
    FeedbackResponse,
    LoginRequest,
    LoginResponse
)



from pydantic import BaseModel, Field
from backend.ai_chat import get_ai_response


# ======================================================
# FASTAPI APP
# ======================================================

app = FastAPI(
    title="GymBuddy AI API",
    description="AI-Based Workout Partner Recommendation System",
    version="1.0.0"
)


# ======================================================
# AI CHAT
# ======================================================

@app.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(request: AIChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    try:
        reply = get_ai_response(message)
        return AIChatResponse(reply=reply)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="The AI assistant is temporarily unavailable. Please try again."
        )



# ======================================================
# FRONTEND DIRECTORY
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# HOME
# ======================================================

@app.get("/", include_in_schema=False)
def serve_homepage():
    return FileResponse(FRONTEND_DIR / "login.html")


# ======================================================
# CREATE USER
# ======================================================

@app.post(
    "/users",
    response_model=UserResponse
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = crud.get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return crud.create_user(
        db,
        user
    )


# ======================================================
# GET ALL USERS
# ======================================================

@app.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):

    return crud.get_users(db)


# ======================================================
# GET USER BY ID
# ======================================================

@app.get(
    "/users/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ======================================================
# CREATE FITNESS PROFILE
# ======================================================

@app.post(
    "/profiles",
    response_model=FitnessProfileResponse
)
def create_profile(
    profile: FitnessProfileCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        profile.user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_profile = crud.get_fitness_profile(
        db,
        profile.user_id
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Fitness profile already exists"
        )

    return crud.create_fitness_profile(
        db,
        profile
    )


# ======================================================
# GET FITNESS PROFILE
# ======================================================

@app.get(
    "/profiles/{user_id}",
    response_model=FitnessProfileResponse
)
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = crud.get_fitness_profile(
        db,
        user_id
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Fitness profile not found"
        )

    return profile


# ======================================================
# UPDATE OR CREATE FITNESS PROFILE
# ======================================================

@app.put(
    "/profiles/{user_id}",
    response_model=FitnessProfileResponse
)
def update_profile(
    user_id: int,
    profile: FitnessProfileCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if profile.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own fitness profile."
        )

    return crud.update_fitness_profile(
        db,
        user_id,
        profile
    )


# ======================================================
# CREATE WORKOUT PREFERENCES
# ======================================================

@app.post(
    "/preferences",
    response_model=WorkoutPreferenceResponse
)
def create_preference(
    preference: WorkoutPreferenceCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        preference.user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_preference = crud.get_workout_preference(
        db,
        preference.user_id
    )

    if existing_preference:
        raise HTTPException(
            status_code=400,
            detail="Workout preferences already exist"
        )

    return crud.create_workout_preference(
        db,
        preference
    )


# ======================================================
# GET WORKOUT PREFERENCES
# ======================================================

@app.get(
    "/preferences/{user_id}",
    response_model=WorkoutPreferenceResponse
)
def get_preference(
    user_id: int,
    db: Session = Depends(get_db)
):

    preference = crud.get_workout_preference(
        db,
        user_id
    )

    if not preference:
        raise HTTPException(
            status_code=404,
            detail="Workout preferences not found"
        )

    return preference


# ======================================================
# UPDATE WORKOUT PREFERENCES
# ======================================================

@app.put(
    "/preferences/{user_id}",
    response_model=WorkoutPreferenceResponse
)
def update_preference(
    user_id: int,
    preference: WorkoutPreferenceCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if preference.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own workout preferences."
        )

    # Creates the preference if it doesn't exist,
    # or updates it if it already exists.
    return crud.update_workout_preference(
        db,
        user_id,
        preference
    )


# ======================================================
# CREATE SCHEDULE
# ======================================================

@app.post(
    "/schedules",
    response_model=ScheduleResponse
)
def create_schedule(
    schedule: ScheduleCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        schedule.user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if schedule.start_time >= schedule.end_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be later than start time."
        )

    return crud.create_schedule(
        db,
        schedule
    )


# ======================================================
# GET SCHEDULES
# ======================================================

@app.get(
    "/schedules/{user_id}",
    response_model=list[ScheduleResponse]
)
def get_schedules(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return crud.get_schedules(
        db,
        user_id
    )


# ======================================================
# UPDATE WORKOUT SCHEDULE
# ======================================================

@app.put(
    "/schedules/{schedule_id}",
    response_model=ScheduleResponse
)
def update_schedule(
    schedule_id: int,
    schedule: ScheduleCreate,
    db: Session = Depends(get_db)
):

    existing_schedule = crud.get_schedule(
        db,
        schedule_id
    )

    if not existing_schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule not found"
        )

    if existing_schedule.user_id != schedule.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own schedule."
        )

    if schedule.start_time >= schedule.end_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be later than start time."
        )

    return crud.update_schedule(
        db,
        schedule_id,
        schedule
    )


# ======================================================
# RECOMMENDATIONS
# ======================================================

@app.get(
    "/recommendations/{user_id}"
)
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    recommendations = generate_recommendations(
        db,
        user_id
    )

    if not recommendations:
        return {
            "message": "No recommendations available yet.",
            "recommendations": []
        }

    return {
        "user_id": user_id,
        "recommendations": recommendations
    }


# ======================================================
# CREATE FEEDBACK
# ======================================================

@app.post(
    "/feedback",
    response_model=FeedbackResponse
)
def create_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        feedback.user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    partner = crud.get_user(
        db,
        feedback.partner_id
    )

    if not partner:
        raise HTTPException(
            status_code=404,
            detail="Workout partner not found"
        )

    if feedback.rating < 1 or feedback.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5."
        )

    return crud.create_feedback(
        db,
        feedback
    )


# ======================================================
# GET FEEDBACK FOR WORKOUT PARTNER
# ======================================================

@app.get(
    "/feedback/{partner_id}",
    response_model=list[FeedbackResponse]
)
def get_partner_feedback(
    partner_id: int,
    db: Session = Depends(get_db)
):

    partner = crud.get_user(
        db,
        partner_id
    )

    if not partner:
        raise HTTPException(
            status_code=404,
            detail="Workout partner not found"
        )

    return crud.get_feedback_for_partner(
        db,
        partner_id
    )


# ======================================================
# LOGIN
# ======================================================

@app.post(
    "/login",
    response_model=LoginResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = crud.login_user(
        db,
        login_data.email,
        login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return user


# ======================================================
# DELETE ACCOUNT
# ======================================================

@app.delete(
    "/users/{user_id}"
)
def delete_account(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    crud.delete_user_account(
        db,
        user_id
    )

    return {
        "message": "Account deleted successfully."
    }


# ======================================================
# SERVE FRONTEND FILES
# ======================================================

app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)