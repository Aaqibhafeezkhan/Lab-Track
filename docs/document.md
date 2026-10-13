
Flow of equipment Borrowing:
1. Students Fill up the borrower's slip & Satisfaction form
2. Students get the borrower's slip signed to their instructor/faculty
3. Students submit the borrower's slip to the lab technician for approval
4. Lab technician checks items requested one by one and marks the ones that are unavailable
5. Lab technician hands over the available items to the student
6. Students return the borrowed items
7. Lab technician checks the borrowed items and confirms none are damaged/missing (if there are missing/damaged, return approval is denied, or items are compensated)
8. Lab technician approves the return approval
9. A digital borrower's slip copy is emailed to the student leader's email
10. Done!

Pages:
1. Admin Page
    - Display current Borrower's names
    - Displays lab equipment borrowed under the borrowers

2. Borrow Page (landing page)
    - Displays a borrow button
    - Upon clicking that burrow button, they are asked to fill up a borrower's slip

3. Login Page
    - Login via google OAuth

Data:
Borrower's Slip = {
    // Student Section
    Date: Date and time
    Int: Group number
    String: Borrower's name
    String: ID Number
    Array<string>: { 
        Int: Quantity
        String: Item Name
        String: Remarks
    }
    Array<String>: {
        String: Name
        String: ID
    }
    E-Sign: Leader's Signature

    // Instructor Section
    String: Noted By (Instructor/Faculty's Signgature)

    // Lab Technician's Section
    String: Released By (Lab Technician's Signature)
}

Satisfaction Form = {
    String: Name (Optional)
    String: College
    Array<string> = {
        Int: Question number
        String: Question
        Int: Rating (1-5)
    }
    String: Question for improvement of the services
}