CampusCompass
Smart Indoor Navigation for Educational Institutions

Hackathon Project Report — The Missing Piece
Event: The Missing Piece Hackathon (µLearn · VJCET)
Date: 27 October 2026
Team Size: 2 Members
Team / Members: INFIINITE LOOP
MEMBERS: P VIVEK SREERAM
            AYMEN SALIM


 1. Abstract
CampusCompass is a proposed smart indoor navigation system designed to help students, faculty members, and visitors locate classrooms and other facilities within a college campus. Students often struggle to find unfamiliar classrooms, especially during examinations when room numbers such as A101, C302, and D224 are assigned. This confusion can cause unnecessary stress, delays, and difficulty reaching the correct examination hall on time.
CampusCompass addresses this problem through an interactive, map-based web application. Users can select their current location, search for a destination, and view a highlighted route along with step-by-step directions. The project aims to make campus navigation simpler, faster, and more accessible through a user-friendly digital interface.
A beginner-friendly web prototype has been developed using HTML, CSS, and JavaScript. The current implementation demonstrates destination search, selectable starting locations, sample indoor locations, graph-based route calculation, and interactive map visualization. The present map uses illustrative data and will require accurate campus mapping and validation before deployment for real-world navigation.
2. Problem Statement
2.1 Identified Problem
In large educational institutions, students may be unfamiliar with the locations of classrooms, laboratories, staff rooms, libraries, and other facilities. This problem becomes particularly significant during examinations, when students are assigned specific rooms identified by codes such as C302 or D224.
Students who do not know the building layout must rely on signboards, ask other students or staff members for directions, or search through corridors. During examination periods, this can create confusion and unnecessary panic. Traditional campus maps may show the overall campus layout but often do not provide interactive, room-level navigation that guides a user from their current location to a specific destination.
2.2 Challenges Identified
•	• Difficulty locating unfamiliar classrooms and examination halls.
•	• Confusion caused by room numbers and multiple academic blocks.
•	• Time wasted asking for directions or searching corridors.
•	• Increased stress when students are running late for examinations.
•	• Limited availability of simple, interactive indoor navigation tools.
2.3 Formal Problem Statement
To develop a user-friendly, technology-driven indoor navigation web application that enables students to identify their current location, search for a classroom or campus facility, and obtain a clear route to their destination within an educational institution.
3. Proposed Solution: CampusCompass
CampusCompass is a web-based indoor navigation prototype designed around the familiarity of map applications such as Google Maps, adapted for navigation within college buildings. Instead of navigating between cities or roads, the application focuses on indoor locations, corridors, rooms, and facilities.
The user selects a starting location, searches for the required destination, and requests a route. The application calculates a path through connected locations and displays the route on an interactive floor map. Step-by-step directions help users understand which locations or corridor junctions they need to pass through.
The initial implementation focuses on A Block as a sample environment. It uses representative classroom numbers and sample facility locations to demonstrate the navigation concept.

 4. Objectives
•	1. To simplify the process of finding classrooms and examination halls.
•	2. To provide an interactive digital map of indoor college spaces.
•	3. To allow users to select their current location and destination.
•	4. To calculate a route between connected locations.
•	5. To display a highlighted path and sequential directions.
•	6. To develop an accessible prototype that runs in a standard web browser.
•	7. To establish a foundation for future campus-wide navigation.
5. Technology Stack
The project uses lightweight web technologies so that it can be developed and demonstrated on an ordinary laptop without requiring a dedicated server.
Technology	Purpose
HTML5	Defines the structure of the application and its interface.
CSS3	Provides the visual design, responsive layout, colors, and interactive styling.
JavaScript	Implements destination search, user interactions, route calculation, and map rendering.
SVG	Draws the sample indoor map, rooms, corridors, route lines, and location markers.
GitHub	Stores the source code and supports project collaboration and version control.
GitHub Pages	Intended deployment platform for publishing the static web application.

 6. System Design and Workflow
6.1 System Workflow
•	1. The user opens the CampusCompass web application.
•	2. The user selects their current location from the available locations.
•	3. The user enters a classroom number or searches for a facility.
•	4. The application validates the selected locations.
•	5. The JavaScript routing engine calculates the shortest path through the connected sample locations.
•	6. The map highlights the calculated route.
•	7. The directions panel displays the sequence of locations along the path.
•	8. The user follows the directions to reach the selected destination.
6.2 Route Calculation
The prototype represents indoor locations as nodes in a graph. Connections between locations, such as rooms and corridor junctions, are represented as edges.
A Breadth-First Search (BFS) algorithm is used to find a path between the selected starting point and destination. BFS finds a path with the fewest edges in an unweighted graph. However, the shortest path in terms of the number of edges is not necessarily the shortest physical walking distance. Distance-weighted routing and accurate corridor geometry can be introduced in a later version.
7. Work Completed So Far
The project has progressed from identifying a campus navigation problem to developing a browser-based prototype.
•	• Problem Identification: Analyzed the difficulty students face when locating unfamiliar examination halls and classrooms, focusing on reducing confusion and wasted time.
•	• Campus Layout Reference: Utilized a campus layout reference image to understand the arrangement of academic blocks and facilities.
•	• User Interface Development: Designed a modern, dark-themed dashboard with location selectors, search bars, shortcuts, zoom controls, and a responsive layout.
•	• Interactive Map Prototype: Implemented a sample SVG floor map containing classrooms, corridors, an entrance, staircase, staff room, computer lab, and library.
•	• Route Calculation: Integrated a JavaScript-driven BFS routing engine that dynamically calculates paths and updates the map and directions panel.
•	• Browser-Based Implementation: Prepared the application to run locally in web browsers with static files ready for GitHub Pages hosting.

 8. Expected Impact
CampusCompass aims to improve the campus experience for students and visitors by making indoor locations easier to find:
•	• Reduced Confusion: Students can search for a classroom rather than depend entirely on verbal directions.
•	• Time Efficiency: A visible route can reduce unnecessary searching and transit time.
•	• Examination Support: Students can identify unfamiliar examination halls more easily.
•	• Information Accessibility: Campus locations can be seamlessly accessed through a browser-based interface.
•	• Visitor Assistance: New students, parents, and visitors can easily navigate campus facilities.
•	• Scalability: Additional blocks, floors, and administrative facilities can be incorporated as map data expands.
9. Current Limitations
•	• Illustrative Map: Room positions and corridor connections are sample data rather than verified architectural floor plans.
•	• Manual Starting Location: Users must manually select their starting point; automatic indoor positioning is not yet implemented.
•	• Limited Locations: Only a small set of sample rooms and facilities is currently included.
•	• Simplified Routing: The algorithm minimizes graph edges rather than exact walking distances.
•	• No Live Positioning: GPS-based indoor positioning, Bluetooth beacons, and similar systems have not been implemented.
•	• No Verified Accessibility: Accessible paths, ramps, lifts, and restricted areas are not yet incorporated.
•	• Deployment & Testing: Successful hosting and real-route validation across the entire campus require final confirmation.
10. Future Scope
•	• Accurate floor plans based on verified campus layouts and blueprints.
•	• Multi-floor navigation supporting staircases and lifts.
•	• Improved routing based on physical distances and route constraints.
•	• Exploration of Bluetooth beacons, Wi-Fi positioning, or QR checkpoints for auto-positioning.
•	• Dedicated examination mode for rapid room-number entry and directions.
•	• Accessibility support for users with mobility requirements.
•	• Administrative interface for authorized room-data updates.
•	• Mobile optimization and usability testing.


12. Conclusion
CampusCompass proposes a practical solution to a common problem in educational institutions: finding the correct classroom or facility in an unfamiliar building.
The project combines a user-friendly web interface, searchable sample locations, an interactive indoor map, and graph-based route calculation. Its lightweight implementation makes it suitable for an initial hackathon demonstration without requiring complex infrastructure.
The work completed so far establishes the foundation of the application. The next major step is to replace illustrative map data with verified campus information, validate corridor connectivity, test routes against actual walking paths, and publish the working prototype. By focusing on a specific problem experienced by students, CampusCompass aims to demonstrate how a simple technology-driven solution can improve navigation and reduce unnecessary confusion within a college campus.

