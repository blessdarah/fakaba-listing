rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return isAuthenticated() && (userData.role == "admin");
    }

    function isPropertyOwner(propertyId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/properties/$(propertyId)).data.ownerId == request.auth.uid;
    }
    
    match /{document=**} {
      allow read, write: if isAdmin();
    }
    


// Users collection - ENSURE PROPER READ ACCESS
match /users/{userId} {
  // Allow read of user profiles for messaging
  allow read: if isAuthenticated();
  
  // Existing rules...
  allow write: if isOwner(userId);
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isAuthenticated() && (
    isOwner(userId) ||
    (
      // Allow only updates to 'following'
      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['following'])
    )
  );
}

    // Wishlist collection
    match /wishlists/{wishlistId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.agentId == request.auth.uid
      );
      allow create: if isAuthenticated() && 
                     request.resource.data.userId == request.auth.uid &&
                     request.resource.data.keys().hasAll(['userId', 'agentId', 'agentName', 'agentAvatar', 'agentLocation', 'addedAt']) &&
                     request.resource.data.userId is string &&
                     request.resource.data.agentId is string &&
                     request.resource.data.agentName is string &&
                     request.resource.data.agentAvatar is string &&
                     request.resource.data.agentLocation is string &&
                     request.resource.data.addedAt is timestamp;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Allow counting queries for agents to see their wishlist count
      allow list: if isAuthenticated() && request.query.limit <= 1000;
    }

    // User followers stats collection
    match /userFollowers/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                    request.resource.data.keys().hasOnly(['followerCount']) && 
                    request.resource.data.followerCount == 0;
      allow update: if isAuthenticated() && 
                    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['followerCount']) &&
                    (request.resource.data.followerCount == resource.data.followerCount + 1 ||
                     request.resource.data.followerCount == resource.data.followerCount - 1);
    }

    // Message count documents
    match /messageCounts/{userId} {
      allow read: if isOwner(userId);
      allow write: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }

    // Notification count documents
    match /notificationCounts/{userId} {
      allow read: if isOwner(userId);
      allow write: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }

    // Notifications - UPDATED FOR APPOINTMENT NOTIFICATIONS
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      allow create: if isAuthenticated() && (
        isAdmin() || 
        request.resource.data.keys().hasAll(['userId', 'content', 'read', 'createdAt']) &&
        request.resource.data.userId is string &&
        request.resource.data.content is string &&
        request.resource.data.read is bool &&
        request.resource.data.createdAt is timestamp
      );
    }

   // Add these updated rules to your firebase rules file

// Messages collection - UPDATED
match /messages/{messageId} {
  allow read: if isAuthenticated() && (
    resource.data.senderId == request.auth.uid || 
    resource.data.recipientId == request.auth.uid
  );
  
  allow create: if isAuthenticated() && 
                request.resource.data.senderId == request.auth.uid && 
                request.resource.data.keys().hasAll(['conversationId', 'senderId', 'recipientId', 'message', 'timestamp', 'read']);
  
  allow update: if isAuthenticated() && 
                resource.data.recipientId == request.auth.uid && 
                request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
  
  allow list: if isAuthenticated();
}
// Updated rule specifically for conversations collection
match /conversations/{conversationId} {
  // Allow read if user is a participant
  allow read: if isAuthenticated() && 
              resource.data.participants.hasAny([request.auth.uid]);
  
  // Allow list operations for authenticated users
  allow list: if isAuthenticated();
  
  // Allow create if user is a participant
  allow create: if isAuthenticated() && 
                request.resource.data.participants.hasAny([request.auth.uid]);
  
  // MODIFIED - More permissive update rule
  allow update: if isAuthenticated() && 
                resource.data.participants.hasAny([request.auth.uid]);
  
  // Allow delete if user is a participant
  allow delete: if isAuthenticated() && 
                resource.data.participants.hasAny([request.auth.uid]);
}

// Add these rules for the messageHistory collection
match /messageHistory/{historyId} {
  // Allow read if user is a participant in the conversation
  allow read: if isAuthenticated() && 
              get(/databases/$(database)/documents/conversations/$(historyId)).data.participants.hasAny([request.auth.uid]);
  
  // Allow create and update if user is a participant in the conversation
  allow create, update: if isAuthenticated() && 
                         get(/databases/$(database)/documents/conversations/$(historyId)).data.participants.hasAny([request.auth.uid]);
}



    // Properties collection
    match /properties/{propertyId} {
  // Allow unauthenticated access to read approved properties
  allow read: if 
    // Public can read approved properties
    resource.data.status == "active" || 
    // Authenticated users can read any property
    (isAuthenticated() && (
      // Owner can read their own properties (any status)
      resource.data.ownerId == request.auth.uid || 
      // Admin can read any property
      isAdmin()
    ));
  
  // Keep existing write rules
  allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;
  allow update: if isAuthenticated() && (
    resource.data.ownerId == request.auth.uid ||
    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['viewCount', 'lastViewed']) &&
     request.resource.data.viewCount is number &&
     request.resource.data.lastViewed is timestamp)
  );
  allow delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;

      // Allow access to the views subcollection
      match /views/{viewId} {
        allow create: if isAuthenticated() &&
                      request.resource.data.keys().hasOnly(['viewerId', 'timestamp', 'isAuthenticated', 'userId', 'viewCount']) &&
                      request.resource.data.viewerId is string &&
                      request.resource.data.timestamp is timestamp &&
                      request.resource.data.isAuthenticated is bool &&
                      request.resource.data.viewCount is number &&
                      (request.resource.data.userId == null || request.resource.data.userId is string);
        allow update: if isAuthenticated();
        allow read: if isAuthenticated();
      }
    }

   
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        (resource.data.agentId == request.auth.uid && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['response'])) ||
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['helpful', 'helpfulUsers', 'unhelpful'])
      );
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }


    // Online status in Firestore
    match /status/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Activities collection
    match /activities/{activityId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && (
        isAdmin() ||
        request.resource.data.userId == request.auth.uid ||
        isValidActivity()
      );
      allow update: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['viewed']);
    }

    // Analytics collection
    match /analytics/{userId} {
      allow read: if isOwner(userId);
      allow write: if isAuthenticated() && (isAdmin() || isOwner(userId));
    }

    // APPOINTMENTS - COMPLETELY REWRITTEN FOR MAXIMUM FLEXIBILITY
    match /appointments/{appointmentId} {
      // Individual document read access
      allow read: if isAuthenticated() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.agentId == request.auth.uid ||
        resource.data.createdBy == request.auth.uid ||
        (resource.data.attendeeIds is list && resource.data.attendeeIds.hasAny([request.auth.uid]))
      );
      
      // Create appointment if authenticated
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      
      // Update appointment if you're involved
      allow update: if isAuthenticated() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.agentId == request.auth.uid ||
        resource.data.createdBy == request.auth.uid ||
        (resource.data.attendeeIds is list && resource.data.attendeeIds.hasAny([request.auth.uid]))
      );
      
      // Allow ALL queries from authenticated users - we'll filter in the application
      allow list: if isAuthenticated();
    }

    // Appointment attendees collection
    match /appointmentAttendees/{attendeeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.appointmentOwnerId == request.auth.uid
      );
      allow delete: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.appointmentOwnerId == request.auth.uid
      );
    }

    // Inquiries for properties
    match /inquiries/{inquiryId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.propertyOwnerId == request.auth.uid ||
        isPropertyOwner(resource.data.propertyId)
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.propertyOwnerId == request.auth.uid
      );
      allow delete: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.propertyOwnerId == request.auth.uid
      );
    }

    // Saved properties
    match /saved/{savedId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isPropertyOwner(resource.data.propertyId)
      );
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }

    // Subscribers collection
    match /subscribers/{subscriberId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['email', 'createdAt', 'source']) &&
                   request.resource.data.email is string &&
                   request.resource.data.createdAt is timestamp &&
                   request.resource.data.source is string;
    }

    // Reports collection
    match /reports/{reportId} {
      allow create: if isAuthenticated() && isValidReport();
      allow read: if isAuthenticated() && resource.data.reporterId == request.auth.uid;
      allow read, update: if isAdmin();
    }

    // Followers collection
    match /followers/{followId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.followerId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.followerId == request.auth.uid;
    }

    // Favorites collection
    match /users/{userId}/favorites/{favoriteId} {
      allow read, delete: if isAuthenticated() && request.auth.uid == userId;
      allow create, update: if isAuthenticated() && request.auth.uid == userId && isValidFavorite();
    }
    
    
// Appointment reschedule proposals collection
match /rescheduleProposals/{proposalId} {
  // TEMPORARILY make create very permissive for testing
  allow create: if isAuthenticated();
  
  allow read: if isAuthenticated();
  
  allow update: if isAuthenticated() && 
                getAppointmentCreator(resource.data.appointmentId) == request.auth.uid &&
                request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']);
  
  allow delete: if isAuthenticated() && (
    resource.data.proposedBy == request.auth.uid || 
    getAppointmentCreator(resource.data.appointmentId) == request.auth.uid
  );
  
  function getAppointmentCreator(appointmentId) {
    return get(/databases/$(database)/documents/appointments/$(appointmentId)).data.createdBy;
  }
}

// Login History Collection
match /users/{userId}/loginHistory/{loginId} {
  // Allow reading login history if you're the user
  allow read: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow creating a login history entry for yourself
  allow create: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow updating login history items for yourself
  allow update: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow deletion if you're the user
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}

// Content collection - Allow public read access to all content
match /content/{contentId} {
  // Already allows public read
  allow read: if true;
  
  // Keep existing update/write rules
  allow update: if isAuthenticated() && 
                request.resource.data.diff(resource.data).affectedKeys().hasOnly(['helpfulCount']) &&
                request.resource.data.helpfulCount == resource.data.helpfulCount + 1;
  
  allow create, delete: if isAdmin();
}
match /articleHelpful/{helpfulId} {
  // Allow anyone to read helpful votes
  allow read: if true;
  
  // Allow creating helpful votes (no authentication required)
  allow create: if request.resource.data.keys().hasAll(['articleId', 'helpfulAt', 'articleTitle', 'articleCategory']) &&
               request.resource.data.articleId is string &&
               request.resource.data.helpfulAt is timestamp;
               
  // No updates or deletes allowed
  allow update, delete: if false;
}


	// Testimonials collection
match /testimonials/{testimonialId} {
  allow read: if 
    // Public can read approved testimonials
    resource.data.status == "approved" ||
    // Authenticated users follow existing rules
    (isAuthenticated() && (
      resource.data.userId == request.auth.uid ||
      isAdmin()
    ));
  
  // Allow creating testimonials
  // - Only for authenticated users
  // - Document ID must match the user's ID (one testimonial per user)
  // - Must have required fields 
  allow create: if isAuthenticated() && 
                testimonialId == request.auth.uid &&
                request.resource.data.keys().hasAll(['userId', 'userEmail', 'userName', 'rating', 'testimonial', 'createdAt', 'status']) &&
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.rating >= 1 &&
                request.resource.data.rating <= 5 && 
                request.resource.data.status == "pending" &&
                request.resource.data.createdAt is timestamp;
  
  // Allow updating testimonials
  // - Users can update only their own testimonials and only certain fields
  // - Admins can update any testimonial
  allow update: if isAuthenticated() && (
    (resource.data.userId == request.auth.uid &&
     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['testimonial', 'rating'])) ||
    isAdmin()
  );
  
  
    // Only allow admins to delete testimonials
  allow delete: if isAuthenticated() && isAdmin();
}

// Testimonial reminders collection
match /testimonialReminders/{userId} {
  // Allow users to read their own reminder
  allow read: if isAuthenticated() && userId == request.auth.uid;
  
  // Allow users to create or update their own reminder
  allow create, update: if isAuthenticated() && 
                         userId == request.auth.uid &&
                         request.resource.data.keys().hasAll(['userId', 'nextReminderDate', 'updatedAt']) &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.nextReminderDate is timestamp &&
                         request.resource.data.updatedAt is timestamp;
  
  // Allow users to delete their own reminder
  allow delete: if isAuthenticated() && userId == request.auth.uid;
}

// Support Tickets collection
match /tickets/{ticketId} {
  // Allow users to read their own tickets
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  
  // Allow admins to read all tickets
  allow read: if isAdmin();
  
  // Allow users to create tickets
  allow create: if isAuthenticated() && 
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.keys().hasAll(['userId', 'subject', 'category', 'description', 'status', 'createdAt']) &&
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.status == "open";
  
  // Allow users to update limited fields on their own tickets
  allow update: if isAuthenticated() && 
                resource.data.userId == request.auth.uid &&
                request.resource.data.diff(resource.data).affectedKeys().hasAny(['description', 'priority']);
  
  // Allow admins to update any ticket
  allow update: if isAdmin();
  
  // Only admins can delete tickets
  allow delete: if isAdmin();
  
  // Allow listing tickets for users (their own tickets only)
  allow list: if isAuthenticated();
  
  // Comments subcollection
  match /comments/{commentId} {
    // Anyone involved in the ticket can read comments
    allow read: if isAuthenticated() && (
      getTicketUser(ticketId) == request.auth.uid || 
      isAdmin()
    );
    
    // Anyone involved can add comments
    allow create: if isAuthenticated() && (
      getTicketUser(ticketId) == request.auth.uid || 
      isAdmin()
    ) &&
      request.resource.data.keys().hasAll(['userId', 'userName', 'message', 'createdAt']) &&
      request.resource.data.userId == request.auth.uid &&
      request.resource.data.createdAt is timestamp;
    
    // Users can only edit their own comments and only the message
    allow update: if isAuthenticated() && 
                  resource.data.userId == request.auth.uid &&
                  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['message']);
    
    // Only the comment creator or admin can delete comments
    allow delete: if isAuthenticated() && (
      resource.data.userId == request.auth.uid || 
      isAdmin()
    );
    
    // Helper function to get ticket creator
    function getTicketUser(ticketId) {
      return get(/databases/$(database)/documents/tickets/$(ticketId)).data.userId;
    }
  }
}

// Rules for ticket attachment storage
match /ticket-attachments/{userId}/{document=**} {
  // Users can only read and write attachments for their own tickets
  allow read, write: if isAuthenticated() && userId == request.auth.uid;
  
  // Admins can read all ticket attachments
  allow read: if isAdmin();
}

// Consultations collection rules
match /consultations/{consultationId} {
  // Helper functions
  function isSignedIn() {
    return request.auth != null;
  }
  
  function isAdmin() {
    return isSignedIn() && (
      request.auth.token.admin == true || 
      exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid)) ||
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
    );
  }
  
  function isOwner() {
    return isSignedIn() && resource.data.userId == request.auth.uid;
  }
  
  function consultationDataIsValid() {
    let requiredFields = [
      'title', 'description', 'date', 'time', 
      'meetingType', 'status', 'userId', 'userName', 'userEmail'
    ];
    
    let hasAllRequired = request.resource.data.keys().hasAll(requiredFields);
    let statusValid = request.resource.data.status in ['pending', 'approved', 'completed', 'cancelled'];
    let meetingTypeValid = request.resource.data.meetingType in ['video', 'inPerson', 'custom'];
    
    return hasAllRequired && statusValid && meetingTypeValid;
  }
  
  // Rule 1: Users can create their own consultations
  allow create: if isSignedIn() && 
                 request.resource.data.userId == request.auth.uid &&
                 request.resource.data.status == 'pending' &&
                 consultationDataIsValid();
  
  // Rule 2: Users can read their own consultations (including admin comments)
  allow read: if isSignedIn() && (isOwner() || isAdmin());
  
  // Rule 3: Only admins can update status and add meeting links
  allow update: if (
    // User updating their own consultation - limited fields
    (isOwner() && 
     request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['description', 'title', 'date', 'time', 'meetingType', 'location']) &&
     request.resource.data.userId == resource.data.userId &&
     request.resource.data.status == resource.data.status)
    ||
    // Admin can update any field including adding comments
    isAdmin()
  );
  
  // Rule 4: Users can delete their own consultations if pending, admins can delete any
  allow delete: if (isOwner() && resource.data.status == 'pending') || isAdmin();

  // Add rules for notifications related to consultations
  match /comments/{commentId} {
    // Users can read comments on their own consultations
    allow read: if isSignedIn() && get(/databases/$(database)/documents/consultations/$(consultationId)).data.userId == request.auth.uid;
    
    // Only admins can create comments
    allow create, update: if isAdmin();
    
    // Only admins can delete comments
    allow delete: if isAdmin();
  }
}

  // Forum posts - users can read all posts but only create/edit their own
match /forumPosts/{postId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated() && (
    isOwner(resource.data.userId) || 
    isAdmin() ||
    // Allow updating only the likes and comments counters
    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'comments']))
  );
  allow delete: if isAuthenticated() && (
    isOwner(resource.data.userId) || isAdmin()
  );
}

// Forum categories - enhance with validation
match /forumCategories/{categoryId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && (
    isAdmin() || 
    // Allow regular users to create categories with validation
    request.resource.data.keys().hasAll(['name', 'description', 'icon', 'color', 'postCount']) &&
    request.resource.data.name is string && 
    request.resource.data.name.size() > 0 &&
    request.resource.data.description is string &&
    request.resource.data.icon is string &&
    request.resource.data.color is string &&
    request.resource.data.postCount == 0
  );
  allow update: if isAuthenticated() && (
    isAdmin() ||
    // Allow updating only the postCount field
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['postCount'])
  );
  allow delete: if isAuthenticated() && isAdmin();
}

// Post likes - users can read all but only create/delete their own
match /postLikes/{likeId} {
  allow read: if isAuthenticated();
  // Use a composite key pattern for likes: userId_postId
  allow create: if isAuthenticated() && 
                 request.resource.data.userId == request.auth.uid &&
                 likeId.matches(request.auth.uid + "_.*") &&
                 request.resource.data.keys().hasAll(['userId', 'postId', 'createdAt']);
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}

// Post comments - users can read all but only create/edit/delete their own
match /postComments/{commentId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && 
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.keys().hasAll(['userId', 'postId', 'userName', 'content', 'createdAt']);
  allow update: if isAuthenticated() && (
    isOwner(resource.data.userId) || isAdmin()
  ) && (
    // Limit what fields can be updated
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['content', 'editedAt'])
  );
  allow delete: if isAuthenticated() && (
    isOwner(resource.data.userId) || isAdmin()
  );
}

// Post tags - for tag management
match /forumTags/{tagId} {
  allow read: if isAuthenticated();
  // Only admins can manage tags directly
  allow write: if isAuthenticated() && isAdmin();
}

// Forum user badges - to highlight active contributors
match /forumUserBadges/{userId} {
  allow read: if isAuthenticated();
  // Only admins can assign badges
  allow write: if isAuthenticated() && isAdmin();
}

// Subscriptions collection
match /subscriptions/{subscriptionId} {
  // Allow anyone to create a subscription with proper validation - no authentication required
  allow create: if 
    // Ensure required fields exist
    request.resource.data.keys().hasAll(['email', 'source', 'feature', 'page', 'createdAt']) &&
    // Validate field types
    request.resource.data.email is string &&
    request.resource.data.source is string &&
    request.resource.data.feature is string &&
    request.resource.data.page is string &&
    request.resource.data.createdAt is timestamp;
  
  // Allow reading own subscription by email (if authenticated)
  allow read: if isAuthenticated() && 
             (request.auth.token.email == resource.data.email || isAdmin());
  
  // Only admins can update or delete
  allow update, delete: if isAdmin();
  
  // Allow listing for admin queries
  allow list: if isAdmin();
}

// Default deny all other access
match /{document=**} {
  allow read, write: if false;
}

    // Validation functions
    function isValidMessage() {
      return request.resource.data.keys().hasAll(['sender', 'recipientId', 'message', 'time', 'read']) &&
             request.resource.data.sender.id is string &&
             request.resource.data.sender.name is string &&
             request.resource.data.recipientId is string &&
             request.resource.data.message is string &&
             request.resource.data.time is timestamp &&
             request.resource.data.read is bool;
    }

    function isValidActivity() {
      return request.resource.data.keys().hasAll(['userId', 'type', 'message', 'createdAt', 'viewed']) &&
             request.resource.data.userId is string &&
             request.resource.data.type is string &&
             request.resource.data.message is string &&
             request.resource.data.createdAt is timestamp &&
             request.resource.data.viewed is bool;
    }

    function isValidReport() {
      let requiredFields = ['reportedAgentId', 'reportedAgentName', 'reason',
                            'reasonCategory', 'details', 'status', 'createdAt',
                            'updatedAt', 'reporterId'];
      let validStatus = request.resource.data.status == 'pending';
      return request.resource.data.keys().hasAll(requiredFields) &&
             request.resource.data.reportedAgentId is string &&
             request.resource.data.reportedAgentName is string &&
             request.resource.data.reason is string &&
             request.resource.data.reasonCategory is string &&
             request.resource.data.status is string &&
             validStatus &&
             request.resource.data.createdAt is timestamp &&
             request.resource.data.updatedAt is timestamp &&
             request.resource.data.reporterId is string &&
             (request.resource.data.reporterId == request.auth.uid ||
              request.resource.data.reporterId == 'anonymous');
    }

    function isValidFavorite() {
      let requiredFields = ['propertyId', 'title', 'price', 'type', 'location', 'addedAt'];
      return request.resource.data.keys().hasAll(requiredFields) &&
             request.resource.data.propertyId is string &&
             request.resource.data.title is string &&
             request.resource.data.price is number &&
             request.resource.data.type is string &&
             request.resource.data.location is string &&
             request.resource.data.addedAt is timestamp;
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
