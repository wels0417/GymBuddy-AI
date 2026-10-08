from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    Time
)

from backend.database import Base


# =========================
# USERS
# =========================

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(String, nullable=False)

    age = Column(Integer, nullable=False)


# =========================
# FITNESS PROFILES
# =========================

class FitnessProfile(Base):
    __tablename__ = "fitness_profiles"

    profile_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    fitness_goal = Column(String)

    experience_level = Column(String)

    workout_type = Column(String)

    intensity = Column(String)

    workout_frequency = Column(Integer)


class WorkoutPreference(Base):
    __tablename__ = "workout_preferences"

    preference_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    preferred_workout = Column(String)
    preferred_intensity = Column(String)
    preferred_duration = Column(Integer)
    preferred_location = Column(String)
    partner_preference = Column(String)

# =========================
# SCHEDULES
# =========================

class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    day = Column(String, nullable=False)

    start_time = Column(Time, nullable=False)

    end_time = Column(Time, nullable=False)


# =========================
# RECOMMENDATIONS
# =========================

class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    partner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    similarity_score = Column(Float)

    schedule_score = Column(Float)

    compatibility_score = Column(Float)

    explanation = Column(Text)


# =========================
# FEEDBACK
# =========================

class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    partner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    rating = Column(Integer)

    comment = Column(Text)

