from pydantic import BaseModel
from typing import Optional
from datetime import time


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: int
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    age: int

    class Config:
        from_attributes = True

class FitnessProfileCreate(BaseModel):
    user_id: int
    fitness_goal: str
    experience_level: str
    workout_type: str
    intensity: str
    workout_frequency: int


class FitnessProfileResponse(BaseModel):
    profile_id: int
    user_id: int
    fitness_goal: str | None = None
    experience_level: str | None = None
    workout_type: str | None = None
    intensity: str | None = None
    workout_frequency: int | None = None

    class Config:
        from_attributes = True

class WorkoutPreferenceCreate(BaseModel):
    user_id: int
    preferred_workout: str
    preferred_intensity: str
    preferred_duration: int
    preferred_location: str
    partner_preference: str

class WorkoutPreferenceResponse(BaseModel):
    preference_id: int
    user_id: int
    preferred_workout: str | None = None
    preferred_intensity: str | None = None
    preferred_duration: int | None = None
    preferred_location: str | None = None
    partner_preference: str | None = None

    class Config:
        from_attributes = True

class ScheduleCreate(BaseModel):
    user_id: int
    day: str
    start_time: time
    end_time: time


class ScheduleResponse(BaseModel):
    schedule_id: int
    user_id: int
    day: str
    start_time: time
    end_time: time

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    user_id: int
    partner_id: int
    rating: int
    comment: str | None = None


class FeedbackResponse(BaseModel):
    feedback_id: int
    user_id: int
    partner_id: int
    rating: int
    comment: str | None = None

    class Config:
        from_attributes = True

# ======================================================
# LOGIN
# ======================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user_id: int
    name: str
    email: str