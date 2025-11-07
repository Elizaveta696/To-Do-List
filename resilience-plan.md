
## 1. Failure: [ Database crash ]

### Detection
How will we know the Database is down?
- [ Ready check fails ]
- [ SequalizeConnectionRefusedError in backend logs]
- [ Monitoring alert triggers ]

### Immediate Impact
Which parts of the app are affected?
- [ Backend API endpoints fail ]
- [ Users cannot log in and fetch/save tasks ]
- [ Frontendd still loads, but shows error logging in ]

### Mitigation
What can we do to reduce impact?
- [ Serve cached data ]
- [ Display maintainance message to users ]
- [ Notify team of the database problem ]

### Recovery
How do we restore service?
- [ Restart database container ]
- [ Restore from latest backup ]
- [ Verify connection via /ready check]

## 2. Failure: [ Express API failure ]

### Detection
How will we know the Express API is down?
- [ Ready and Health chect are down ]
- [ Docker errors or exited unexpectedly]
- [ Monitoring alert triggers ]

### Immediate Impact
Which parts of the app are affected?
- [ API requests fail ]
- [ Frontend cannot fetch or save data ]
- [ Database remains healthy ]

### Mitigation
What can we do to reduce impact?
- [ Serve data from the backup file ]
- [ Display maintainance message to users ]
- [ Docker should automatically restart the backend image ]

### Recovery
How do we restore service?
- [ Restore logs ]
- [ Manually restart container ]
- [ Redeploy backend if needed ]

## 3. Failure: [ Frontend failure ]

### Detection
How will we know the Express API is down?
- [ Site cannot be reeached ]
- [ Health check shows error ]
- [ Container status: exited(1) ]

### Immediate Impact
Which parts of the app are affected?
- [ There is no UI ]
- [ Database and Backend remain healthy but cannot be reached ]

### Mitigation
What can we do to reduce impact?
- [ Display maintainance message to users ]
- [ Docker should automatically restart the frontend image ]

### Recovery
How do we restore service?
- [ Restore logs ]
- [ Manually restart container ]
- [ Redeploy frontend image if needed ]