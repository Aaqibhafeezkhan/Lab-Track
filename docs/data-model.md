items/{itemId}
  name (string), totalQty (number), availableQty (number), active (boolean)

slip/{slipId}                  // Borrower's slip
  code (string)                // short backup code
  status (string)              // submitted | released | returned | rejected
  createdBy (string)           // uid
  createdAt, releasedAt, returnedAt (timestamps)
  groupNumber (number)
  leaderName, leaderIdNumber, leaderEmail (strings)
  members (array of maps)      // { name, idNumber }
  items (array of maps)        // { itemId, name, qtyRequested, qtyReleased, qtyReturned, remarks }
  leaderSignature (string)     // image data
  instructorName (string), instructorSignature (string)
  releasedBy (string), returnNotes (string)

surveys/{surveyId}             // satisfactory survey
  slipId (string), createdAt (timestamp)
  name (string, optional), college (string)
  ratings (map)                // { q1: 5, q2: 4, ... }
  improvement (string)

config/survey
  questions (array of strings)

users/{uid}
  email (string), name (string), role (string)   // student | admin