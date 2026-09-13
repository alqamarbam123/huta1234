# Security Specification: HUTA.lk Real-Time Chat

## 1. Data Invariants
1. A conversation document can only be accessed (read/write) by authenticated participants (`buyerId == request.auth.uid || sellerId == request.auth.uid`).
2. When creating a conversation, the initiator MUST be authenticated and their `request.auth.uid` MUST match `buyerId`.
3. A message in `/conversations/{conversationId}/messages/{messageId}` can only be created by an authenticated user who is a valid participant of the parent conversation (`request.auth.uid == buyerId || request.auth.uid == sellerId`).
4. A message's `senderId` MUST strictly equal `request.auth.uid`.
5. Message text must be non-empty and limited to 2000 characters to prevent denial-of-wallet resource attacks.
6. Messages cannot be modified or deleted by users once sent (immutable log).
7. Document IDs must be alphanumeric strings bounded to 128 characters (`isValidId`).
8. The root database defaults to deny-all.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated conversation creation**: Attempting to create a conversation with no auth.
2. **Identity Spoofing in Conversation**: Authenticated user 'userA' creating conversation with `buyerId: 'userB'`.
3. **Ghost / Shadow Field Injection**: Conversation creation with injected unlisted key `isAdmin: true`.
4. **Oversized Message String Attack**: Creating a message with 100KB string to exhaust storage.
5. **Unauthorized Conversation Reading**: Authenticated user 'userC' attempting to read conversation between 'userA' and 'userB'.
6. **Malicious Message Sender Spoofing**: Authenticated user 'userA' posting message with `senderId: 'userB'`.
7. **Cross-Conversation Message Injection**: Creating a message in conversation 'conv1' with `conversationId: 'conv2'`.
8. **Unauthorized Message List**: Third party querying `/conversations/{convId}/messages`.
9. **Message Tampering (Update)**: Attempting to update a sent message text.
10. **Message Deletion Attack**: Attempting to delete messages from the subcollection.
11. **ID Poisoning Attack**: Passing a 2KB garbage string as `conversationId`.
12. **Blank Text Payload**: Creating a message with empty string `text: ""` violating minLength.
