# Database Schema Documentation

This document provides an overview of the database schema used in the Jobility backend application. Below are the details of each model and their respective fields:

## Agent
- **userId**: String (required)
- **uid**: String (required)
- **company**: String (required)
- **hq_address**: String (required)
- **working_hrs**: String (required)

## Application
- **user**: ObjectId (ref: User)
- **job**: ObjectId (ref: Job)
- **status**: String (default: 'pending')
- **details**: String

## ApplicationAlert
- **userId**: ObjectId (ref: User, required)
- **jobId**: ObjectId (ref: Job, required)
- **notified**: Boolean (default: false)

## ApplicationLogs
- **user**: ObjectId (ref: User)
- **job**: ObjectId (ref: Job)
- **status**: String
- **details**: String


## Chat
- **chatName**: String (trimmed)
- **users**: Array of ObjectId (ref: User)
- **latestMessage**: ObjectId (ref: Message)

## Job
- **title**: String (required)
- **location**: String (required)
- **company**: String (required)
- **salary**: String (required)
- **description**: String (required)
- **agentName**: String (required)
- **period**: String (required)
- **contract**: String (required)
- **hiring**: Boolean (default: true, required)
- **requirements**: Array (required)
- **imageUrl**: String (required)
- **agentId**: String (required)
- **acceptedDisabilities**: Array of objects with `type` and `specificNames` (required)

## JobAlert
- **userId**: ObjectId (ref: User, required)
- **jobId**: ObjectId (ref: Job, required)
- **notified**: Boolean (default: false)

## Message
- **sender**: ObjectId (ref: User)
- **content**: String (trimmed)
- **receiver**: String (trimmed)
- **chat**: ObjectId (ref: Chat)
- **readBy**: Array of ObjectId (ref: User)

## Review
- **reviewerId**: ObjectId (ref: User, required)
- **jobId**: ObjectId (ref: Job, optional)
- **agentId**: ObjectId (ref: Agent, optional)
- **rating**: Number (required, min: 1, max: 5)
- **comment**: String (required)

## Skill
- **userId**: String (required)
- **skill**: String (required)

## User
- **username**: String (required, unique)
- **name**: String (required)
- **email**: String (required, unique)
- **password**: String (required)
- **uid**: String (required)
- **location**: String
- **phone**: String
- **updated**: Boolean (default: false)
- **isAdmin**: Boolean (default: false)
- **isAgent**: Boolean (default: false)
- **skills**: Array (default: [])
- **profile**: String (required, default: URL)
- **disability**: String
- **pwdIdImage**: String
- **resume**: String
- **fcmToken**: String
- **education**: Array of EducationSchema
- **experience**: Array of ExperienceSchema

---

This document is intended to assist developers and database administrators in understanding the structure and relationships within the Jobility backend database.
