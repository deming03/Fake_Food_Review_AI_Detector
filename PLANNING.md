📱 Fake Food Review AI-Detector (iOS + AWS Backend)
🔹 Goal

An iOS app that allows users to:

Paste a Google Maps restaurant URL or search for a restaurant name

Or trigger via iOS Shortcut + Back Tap inside Google Maps → automatically send the restaurant link to AWS

Backend scrapes reviews + AI analyzes → returns a Fake Review Report

🔹 iOS App Features

Restaurant Input

Paste Google Maps URL

Search by restaurant name (Google Places API or internal DB)

Trigger from iOS Shortcut → auto-send current restaurant link

Fake Review Analysis

Show a credibility score (0–100)

Highlight suspicious/fake reviews detected by AI

Display review stats (sentiment chart, time trend, etc.)

Result Storage & History

DynamoDB stores past analyses

Users can view previous results

🔹 AWS Architecture (Minimal 6 Services)

ECS + Fargate

Run Playwright scraper

Collect 1000+ reviews per request

AWS Lambda

API orchestration

Triggers ECS scraping tasks

Calls Bedrock for AI analysis

Amazon DynamoDB

Store restaurants, reviews, analysis results

Amazon Bedrock

AI inference (LLaMA2 / Mistral)

Fake review detection (bot-like writing, repeated patterns, promotional bias)

Amazon API Gateway

Provides REST API for iOS App

Handles auth, CORS, rate limiting

AWS Amplify (Optional)

Web dashboard (secondary front-end)

🔹 iOS Shortcut Integration
Flow (Back Tap → Shortcut → AWS)

User is on a Google Maps restaurant page

User double-taps back of iPhone (Back Tap) → launches Shortcut

Shortcut fetches current restaurant URL via “Share Link”

Shortcut opens your iOS App (via App URL Scheme) and passes the link

iOS App → calls API Gateway → Lambda → ECS + Bedrock

AI analysis completes → result returned to App (or via notification)

⚠️ Limitation: iOS Shortcut cannot fully auto-read Google Maps current URL.
👉 Hackathon-friendly solution: User taps Share → Shortcut → App → Analysis Result.


🔹 Development Roadmap
Phase 1 – Backend Core 

Set up AWS (API Gateway + Lambda + ECS + DynamoDB + Bedrock)

Deploy Playwright scraper → pull reviews

Basic fake review detection via Bedrock

Phase 2 – iOS App Core

Build in Swift/SwiftUI

Support restaurant input (URL / search)

Display credibility score + suspicious reviews

Phase 3 – iOS Shortcut Integration 

Support URL Scheme in App

Shortcut grabs Google Maps “Share Link” → opens App

Demo UX: Google Maps → Share → Shortcut → Analysis

Phase 4 – Optimization & Demo Prep 

Add DynamoDB history lookup

Improve UI + charts

Pitch-ready demo: Back Tap → One-tap Fake Review Detector