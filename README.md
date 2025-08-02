# Student management app

## Tech Stack
- frontend framework: Nuxt
- ui framework: ionic
- server framework: Nuxt
- database: zero-sync https://zero.rocicorp.dev/docs/introduction or other local first database

## Introduction

this project is a mobile student management web-app, that allow user to manage the student and booking.

## Draft schema

- user
  - username
  - password (hash)
- Student
  - name : string (required)
  - password (hash) ( optional)
  - registed :boolean (default: false)
  - phone : string (required)
  - email : string (optional)
  - address : string (optional)
  - credits : number (default: 0)
- Package
  - name : string (required)
  - credits : number (required)
  - price : number (required)
  - duration : number (required)
  - description : string (optional)
- Class Type
  - name : string (required)
  - description : string (optional)
- Schedule
  - class_type_id : string (required)
  - seat : number (required)
  - weekly: mon, tue, wed, thu, fri, sat, sun (array of day)
  - startDate : date (required)
  - endDate : date (optional)
  - startTime : time (required)
  - endTime : time (required)
  - credit : number (required)
  - description : string (optional)
- Class
  - schedule_id : string (required)
  - class_type_id : string (required)
  - status : string (required)
  - start_time : time (required)
  - end_time : time (required)
  - date : date (required)
- Booking
  - student_id : string (required)
  - class_type_id : string (required)
  - status : book, cancel, done (default: book)
- location
  - name : string (required)
  - address : string (required)
  - phone : string (required)
  - email : string (optional)
  - website : string (optional)
- transaction
  - student_id : string (required)
  - package_id : string (optional)
  - class_id : string (optional)
  - amount : number (required)
  - type: package, class, one-time (default: one-time)
  - payment_method : cash, bank_transfer, credit_card (default: cash)
  - payment_note : string (optional)
  
