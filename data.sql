-- INSERT DATA
-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- users
INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt") VALUES ('cmc1p577i0000fcy4iafh42k2', 'admin@snpitc.in', 'Administrator', '$2b$12$8yvxDl62B3qmOZ9.oKQbHubflSRZ0Wg6uHPkURCPh04EmDrL1JFVm', 'ADMIN', '2025-06-18T08:34:57.342Z', '2025-06-20T05:12:56.144Z');
INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt") VALUES ('cmc4cs4i70000fc5sh1sbu4qa', 'navjeetsaharan5@gmail.com', 'Navjeet Saharan', '$2b$12$b8fbaMAlSBMUVnqvVNLajezON7FUbCLAUyqN8S8T2VkWgdwUJBWpS', 'ADMIN', '2025-06-20T05:12:10.448Z', '2025-06-20T05:12:10.448Z');

-- pages
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p5pxz000lfcp0hcio6yke', 'Welcome to SN Pvt ITI', 'home', 'S.N. Pvt. Industrial Training Institute welcomes you with Job oriented Industrial Training Courses.', 'S.N. Pvt. Industrial Training Institute welcomes you with Job oriented Industrial Training Courses. These courses help trainees for employment in public or private sector & Self employment...', 'S.N. Pvt. Industrial Training Institute', 'Job oriented Industrial Training Courses for employment in public or private sector & Self employment', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-18T08:35:21.623Z', '2025-06-18T08:35:21.623Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mux0003fchsbpxwlvbd', 'About Us', 'about-us', 'Information about the institute', NULL, 'About Us', 'Information about the institute', 'PUBLISHED', NULL, 2, NULL, 0, '2025-06-18T08:38:24.249Z', '2025-06-18T08:38:24.249Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mva0005fchspwnhp1st', 'About Institute', 'about-institute', 'Detailed information about S.N. Pvt. Industrial Training Institute including establishment details, contact information, and official credentials.', '
          <div class="space-y-8">
            <div class="overflow-x-auto">
              <table class="min-w-full border border-gray-300">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2 text-left">Field Name</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Name of The Institute</td>
                    <td class="border border-gray-300 px-4 py-2">S.N. Pvt. Industrial Training Institute</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Address of the Institute</td>
                    <td class="border border-gray-300 px-4 py-2">D-117, Kaka Colony, Gandhi Vidhya Mandir, Teh.-Sardar Shahar, Dist. Churu</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Date of Establishment</td>
                    <td class="border border-gray-300 px-4 py-2">17-08-2009</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">DGET File Reference No.</td>
                    <td class="border border-gray-300 px-4 py-2">DGET-6/20/35/2009-TC(New Pvt)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Code Allotted by DGET</td>
                    <td class="border border-gray-300 px-4 py-2">P-574</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Contact No.</td>
                    <td class="border border-gray-300 px-4 py-2">9571075067</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Mobile No.</td>
                    <td class="border border-gray-300 px-4 py-2">9414947801</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">E mail ID</td>
                    <td class="border border-gray-300 px-4 py-2">snitcsrdr@gmail.com</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">Location</td>
                    <td class="border border-gray-300 px-4 py-2">Urban</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4">Key Information</h3>
              <ul class="space-y-2">
                <li><strong>Approved by:</strong> Directorate of Technical Education, Govt. of Rajasthan</li>
                <li><strong>Affiliated to:</strong> NCVT (DGE&T) Govt. of India since 2009</li>
                <li><strong>Institute Code:</strong> P-574</li>
                <li><strong>Category:</strong> Category I Private Institute</li>
              </ul>
            </div>
          </div>
        ', 'About Institute', 'Basic information and details about the institute', 'PUBLISHED', 'cmc1p9mux0003fchsbpxwlvbd', 1, NULL, 0, '2025-06-18T08:38:24.263Z', '2025-06-18T13:20:50.156Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mvi0007fchsh3fccss2', 'Introduction of Institute', 'introduction-institute', 'Detailed introduction, objectives, mission and vision', NULL, 'Introduction of Institute', 'Detailed introduction, objectives, mission and vision', 'PUBLISHED', 'cmc1p9mux0003fchsbpxwlvbd', 2, NULL, 0, '2025-06-18T08:38:24.271Z', '2025-06-18T08:38:24.271Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mvr0009fchsl4pwuww7', 'Scheme Running in The Institute', 'scheme-running', 'Current schemes and programs running in the institute', NULL, 'Scheme Running in The Institute', 'Current schemes and programs running in the institute', 'PUBLISHED', 'cmc1p9mux0003fchsbpxwlvbd', 3, NULL, 0, '2025-06-18T08:38:24.279Z', '2025-06-18T08:38:24.279Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mvz000bfchsnodrrz0n', 'Admissions', 'admissions', 'Admission related information', NULL, 'Admissions', 'Admission related information', 'PUBLISHED', NULL, 3, NULL, 0, '2025-06-18T08:38:24.287Z', '2025-06-18T08:38:24.287Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mw8000dfchsbmeedma9', 'Admission Criteria', 'admission-criteria', 'Complete admission criteria, eligibility requirements, and admission procedure for S.N. Pvt. Industrial Training Institute.', '
          <div class="space-y-8">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4">Available Trades</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full border border-gray-300">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="border border-gray-300 px-4 py-2 text-left">Name of Trade under NCVT</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Duration of Training</th>
                      <th class="border border-gray-300 px-4 py-2 text-left">Eligibility Qualification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">Electrician</td>
                      <td class="border border-gray-300 px-4 py-2">2 Years</td>
                      <td class="border border-gray-300 px-4 py-2">10th Pass</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="prose max-w-none">
              <h3 class="text-xl font-semibold mb-4">Admission Policy</h3>
              <p>
                We strictly follow the admission policy and procedure given by the Rajasthan Directorate of technical education Jodhpur. We shall admit the students purely on the merit based on the marks secured by the candidate in the public examinations based on the minimum qualifications prescribed for the respective trade only as per the maximum number of students allowed for each trade.
              </p>

              <p>
                We maintain safe custody of the documents submitted by the students including birth certificates, certificates of previous Institution and deposits, if any.
              </p>

              <h4 class="text-lg font-semibold mt-6 mb-3">Admission Procedure</h4>
              <ol class="list-decimal list-inside space-y-2">
                <li>The dates for different trades to be announced.</li>
                <li>Advertisement shall be carried in the local areas through paper media, miking, and one to one canvassing etc.</li>
                <li>All the enquiries personnel and telephonic shall be recorded in the register.</li>
                <li>A date for interview to be announced and informed to the potential candidates</li>
                <li>The faculties shall conduct interview and select requisite no. of candidates based on merit.</li>
                <li>While selecting the candidates the reservation criteria as per NCVT /DTE Jodhpur guidelines shall be adhered.</li>
                <li>A first list of selected candidates will be display and cut-off date shall be announced.</li>
                <li>After cut-off first list second is released, if necessary third and fourth to be continued.</li>
                <li>All the selected candidates shall be registered and sent to their respective classes.</li>
              </ol>

              <div class="bg-yellow-50 p-4 rounded-lg mt-6">
                <p class="font-medium">
                  We shall reserves seats for Schedule Caste, Schedule Tribe, and OBC as per the policy of Rajasthan / and Central Government.
                </p>
              </div>
            </div>
          </div>
        ', 'Admission Criteria', 'Criteria and requirements for admission', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 1, NULL, 0, '2025-06-18T08:38:24.296Z', '2025-06-18T13:20:50.187Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mwh000ffchsh7jrdw6s', 'Trades Affiliated To NCVT and SCVT', 'trades-ncvt-scvt', 'Complete overview of all trades affiliated to both NCVT and SCVT at our institute.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">NCVT & SCVT Affiliated Trades</h2>
            <p class="mb-6">S.N. Private Industrial Training Institute is affiliated with both National Council for Vocational Training (NCVT) and State Council for Vocational Training (SCVT), providing comprehensive technical education opportunities.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-blue-900 mb-4">NCVT Affiliated Trades</h3>
                <div class="space-y-3">
                  <div class="bg-white p-4 rounded">
                    <h4 class="font-semibold">Electrician</h4>
                    <p class="text-sm text-gray-600">Duration: 2 Years | Capacity: 126 seats</p>
                    <p class="text-sm text-gray-600">Order No: 6/20/35/2009-TC</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-green-900 mb-4">SCVT Affiliated Trades</h3>
                <div class="space-y-3">
                  <div class="bg-white p-4 rounded">
                    <p class="text-sm text-gray-600">Currently expanding SCVT trade offerings</p>
                    <p class="text-sm text-gray-600">Contact institute for latest updates</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-8">
              <h3 class="text-lg font-semibold mb-4">Key Features</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded">
                  <h4 class="font-semibold">Industry Recognition</h4>
                  <p class="text-sm text-gray-600">Certificates recognized nationwide</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded">
                  <h4 class="font-semibold">Practical Training</h4>
                  <p class="text-sm text-gray-600">Hands-on workshop experience</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded">
                  <h4 class="font-semibold">Placement Support</h4>
                  <p class="text-sm text-gray-600">Job assistance after completion</p>
                </div>
              </div>
            </div>
          </div>
        ', 'NCVT & SCVT Affiliated Trades - S.N. ITI', 'Comprehensive overview of all NCVT and SCVT affiliated trades at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 2, NULL, 0, '2025-06-18T08:38:24.305Z', '2025-06-19T05:15:06.020Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mwp000hfchs85wirsxb', 'Summary of Trades Affiliated to NCVT', 'trades-ncvt', 'Our institute offers NCVT-affiliated trades that provide industry-recognized certification and excellent career opportunities.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">NCVT Affiliated Trades</h2>
            <p class="mb-6">All trades are approved by the Directorate General of Employment & Training (DGE&T), Government of India since 2009.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1st Intake</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2nd Capacity</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3rd Total No. of Units</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DGET Order No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ELECTRICIAN</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">02</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">02</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">02</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6/20/35/2009-TC</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8">
              <h3 class="text-lg font-semibold mb-4">Trade Details</h3>
              <div class="bg-blue-50 p-6 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-2">Electrician Trade</h4>
                <ul class="text-blue-800 space-y-1">
                  <li>• Duration: 2 Years</li>
                  <li>• Total Capacity: 126 sanctioned seats</li>
                  <li>• Shifts: 2 shifts available</li>
                  <li>• Affiliation: NCVT (National Council for Vocational Training)</li>
                  <li>• Established: 2009</li>
                </ul>
              </div>
            </div>
          </div>
        ', 'NCVT Affiliated Trades - S.N. ITI', 'View the complete list of NCVT affiliated trades offered at S.N. Private Industrial Training Institute with detailed information about capacity and approval orders.', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 3, NULL, 0, '2025-06-18T08:38:24.313Z', '2025-06-19T05:15:05.963Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mwx000jfchsnzgb73jf', 'Summary of Trades Affiliated To SCVT', 'trades-scvt', 'Information about trades affiliated to State Council for Vocational Training (SCVT).', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Summary of Trades Affiliated to SCVT</h2>
            <p class="mb-6">State Council for Vocational Training (SCVT) affiliated trades information.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1st Intake</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2nd Capacity</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3rd Total No. of Units</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="6">
                      <div class="text-center py-8">
                        <p class="text-gray-500">Currently no SCVT affiliated trades available.</p>
                        <p class="text-sm text-gray-400 mt-2">The institute is focusing on NCVT affiliated programs.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">Future Plans</h3>
              <p class="text-blue-800">The institute is exploring opportunities to introduce SCVT affiliated trades to provide more diverse educational options for students. Stay tuned for updates on new trade offerings.</p>
            </div>
          </div>
        ', 'SCVT Affiliated Trades - S.N. ITI', 'Information about State Council for Vocational Training (SCVT) affiliated trades at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 4, NULL, 0, '2025-06-18T08:38:24.321Z', '2025-06-19T05:15:05.996Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mx4000lfchsk8nf05ce', 'Application Format', 'application-format', 'Download application forms and admission documents for various courses.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Application Format</h2>
            <p class="mb-6">Download the required application forms for admission to various courses offered at our institute.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Course</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentative Date of Course</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When to Apply</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Format</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Electrician</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 Years</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">August</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10th pass</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/downloads/ApplicationForm.pdf" target="_blank" class="hover:underline">
                        Click Here to Download Application Form
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Application Process</h3>
                <ol class="text-green-800 space-y-2">
                  <li>1. Download the application form</li>
                  <li>2. Fill all required details carefully</li>
                  <li>3. Attach necessary documents</li>
                  <li>4. Submit at institute office</li>
                  <li>5. Pay the application fee</li>
                </ol>
              </div>
              <div class="bg-yellow-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-yellow-900 mb-4">Required Documents</h3>
                <ul class="text-yellow-800 space-y-2">
                  <li>• 10th class mark sheet</li>
                  <li>• Transfer certificate</li>
                  <li>• Character certificate</li>
                  <li>• Passport size photographs</li>
                  <li>• Caste certificate (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>
        ', 'Application Format - S.N. ITI', 'Download application forms and admission documents for courses at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 5, NULL, 0, '2025-06-18T08:38:24.329Z', '2025-06-19T05:15:06.005Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mxc000nfchsr71s6rg0', 'Fee Structure', 'fee-structure', 'Complete fee structure and payment details for all courses offered at our institute.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Fee Structure</h2>
            <p class="mb-6">Our institute offers affordable and transparent fee structure for quality technical education.</p>

            <div class="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 class="text-lg font-semibold text-blue-900 mb-4">Download Official Fee Structure</h3>
              <p class="text-blue-800 mb-4">For the most current and detailed fee information, please download our official fee structure document.</p>
              <a href="/downloads/Fee sniti.pdf" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download Fee Structure PDF
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-4">General Information</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Fees are to be paid semester-wise</li>
                  <li>• Late payment charges may apply</li>
                  <li>• Scholarships available for eligible students</li>
                  <li>• Fee concessions for economically weaker sections</li>
                  <li>• Payment can be made in cash or by demand draft</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-4">Payment Methods</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Cash payment at institute office</li>
                  <li>• Demand Draft in favor of "S.N. ITI"</li>
                  <li>• Bank transfer (details available on request)</li>
                  <li>• Online payment (coming soon)</li>
                </ul>
              </div>
            </div>

            <div class="mt-8 p-6 bg-yellow-50 rounded-lg">
              <h3 class="text-lg font-semibold text-yellow-900 mb-2">Important Note</h3>
              <p class="text-yellow-800">Fee structure is subject to change as per government regulations and NCVT guidelines. Students are advised to confirm the current fee structure at the time of admission.</p>
            </div>
          </div>
        ', 'Fee Structure - S.N. ITI', 'Complete fee structure and payment information for courses at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mvz000bfchsnodrrz0n', 6, NULL, 0, '2025-06-18T08:38:24.336Z', '2025-06-19T05:15:05.986Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mxl000pfchsbf14pc1f', 'Facilities', 'facilities', 'Institute facilities and infrastructure', NULL, 'Facilities', 'Institute facilities and infrastructure', 'PUBLISHED', NULL, 4, NULL, 0, '2025-06-18T08:38:24.345Z', '2025-06-18T08:38:24.345Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mxu000rfchsdlbuwixj', 'Infrastructure, Building and Workshop', 'infrastructure', 'Comprehensive overview of our institute''s infrastructure, building facilities, and workshop areas.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Infrastructure Details</h2>
            <p class="mb-6">Our institute boasts modern infrastructure designed to provide the best learning environment for technical education.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl. No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area in Sq. Mt.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">a</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Area</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">557 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">b</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Covered Area</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">457 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">c</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Class Room Area</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">42 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">d</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Workshop Area</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">200 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">e</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Drawing Hall</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Included in trade workshop</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">f</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Audio Visual Hall</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">g</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Computer Lab</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">380 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">h</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Play Area</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">Under Development</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">i</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Library</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">27.5 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Total Area</h3>
                <p class="text-3xl font-bold text-blue-600">557</p>
                <p class="text-sm text-blue-700">Square Meters</p>
              </div>
              <div class="bg-green-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-green-900 mb-2">Covered Area</h3>
                <p class="text-3xl font-bold text-green-600">457</p>
                <p class="text-sm text-green-700">Square Meters</p>
              </div>
              <div class="bg-purple-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-purple-900 mb-2">Workshop Area</h3>
                <p class="text-3xl font-bold text-purple-600">200</p>
                <p class="text-sm text-purple-700">Square Meters</p>
              </div>
            </div>
          </div>
        ', 'Infrastructure & Building - S.N. ITI', 'Detailed overview of infrastructure, building facilities, and workshop areas at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 1, NULL, 0, '2025-06-18T08:38:24.354Z', '2025-06-19T05:15:05.975Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9my2000tfchsh4wzh6tr', 'Trade Specific Infrastructure', 'trade-infrastructure', 'Detailed information about trade-specific infrastructure, building and workshop facilities.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Trade Specific Infrastructure Building and Workshop</h2>
            <p class="mb-6">Comprehensive details of our trade-specific infrastructure and workshop facilities designed for practical training.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Room Area Per Unit</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Class room area for trade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workshop area per unit</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Workshop area for Trade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Electrician (Existing)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">02</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">21.06 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">21.06 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">99.06 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">99.06 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/infrastructure/workshop.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Electrician (App. for Affi.)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">21 Sq.Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">42 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100 SqMt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100 Sq. Mt.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/infrastructure/workshop.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Total Classroom Area</h3>
                <p class="text-3xl font-bold text-blue-600">63.06</p>
                <p class="text-sm text-blue-700">Square Meters</p>
              </div>
              <div class="bg-green-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-green-900 mb-2">Total Workshop Area</h3>
                <p class="text-3xl font-bold text-green-600">199.06</p>
                <p class="text-sm text-green-700">Square Meters</p>
              </div>
              <div class="bg-purple-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-purple-900 mb-2">Total Units</h3>
                <p class="text-3xl font-bold text-purple-600">6</p>
                <p class="text-sm text-purple-700">Training Units</p>
              </div>
            </div>
          </div>
        ', 'Trade Specific Infrastructure - S.N. ITI', 'Detailed information about trade-specific infrastructure, building and workshop facilities at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 2, NULL, 0, '2025-06-18T08:38:24.362Z', '2025-06-19T05:15:06.012Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mya000vfchs7jytvuso', 'Electric Power Supply', 'electric-power', 'Details about electric power supply and electrical infrastructure at our institute.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Electric Power Supply</h2>
            <p class="mb-6">Complete information about our electrical infrastructure and power supply details.</p>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanned Document / Image</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Present Electric Load</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">11 KW</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/electricity/electricity.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Date of Connection</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16-03-2009</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/electricity/electricity.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Connection in the name of</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Head Master S.N. Industries Prashikshan Kendra</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/electricity/electricity.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Meter No.</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">523679</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href="/images/electricity/electricity.jpg" target="_blank" class="hover:underline">View Image</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-yellow-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-yellow-900 mb-4">Power Specifications</h3>
                <ul class="text-yellow-800 space-y-2">
                  <li>• Total Load Capacity: 11 KW</li>
                  <li>• Connection Date: March 16, 2009</li>
                  <li>• Meter Number: 523679</li>
                  <li>• Registered Name: Head Master S.N. Industries Prashikshan Kendra</li>
                </ul>
              </div>
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Power Usage</h3>
                <ul class="text-green-800 space-y-2">
                  <li>• Workshop Equipment</li>
                  <li>• Classroom Lighting</li>
                  <li>• Computer Lab</li>
                  <li>• Administrative Offices</li>
                  <li>• Library Facilities</li>
                </ul>
              </div>
            </div>
          </div>
        ', 'Electric Power Supply - S.N. ITI', 'Details about electric power supply and electrical infrastructure at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 3, NULL, 0, '2025-06-18T08:38:24.370Z', '2025-06-19T05:16:55.550Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9myi000xfchss6444l02', 'Library', 'library', 'Complete information about our library facilities and available books.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Library</h2>
            <p class="mb-6">Our library is equipped with comprehensive technical books and resources to support student learning.</p>
            
            <h3 class="text-xl font-semibold mb-4">List of Available Books</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Book</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr><td class="px-6 py-4 text-sm text-gray-500">1</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician trade theory 1st semester</td><td class="px-6 py-4 text-sm text-gray-500">10</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">2</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician trade theory 2nd semester</td><td class="px-6 py-4 text-sm text-gray-500">10</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">3</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician trade theory 3rd semester</td><td class="px-6 py-4 text-sm text-gray-500">10</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">4</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician trade theory 4th semester</td><td class="px-6 py-4 text-sm text-gray-500">10</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">5</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Engineering drawing</td><td class="px-6 py-4 text-sm text-gray-500">13</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">6</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Workshop calculation</td><td class="px-6 py-4 text-sm text-gray-500">15</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">7</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician practical 1st semester</td><td class="px-6 py-4 text-sm text-gray-500">09</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">8</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician practical 2nd semester</td><td class="px-6 py-4 text-sm text-gray-500">09</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">9</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician practical 3rd semester</td><td class="px-6 py-4 text-sm text-gray-500">06</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">10</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician practical 4th semester</td><td class="px-6 py-4 text-sm text-gray-500">02</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">11</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Electrician assignment/test</td><td class="px-6 py-4 text-sm text-gray-500">11</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">12</td><td class="px-6 py-4 text-sm text-gray-900">Electrician</td><td class="px-6 py-4 text-sm text-gray-500">Instructor guide</td><td class="px-6 py-4 text-sm text-gray-500">03</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">13</td><td class="px-6 py-4 text-sm text-gray-900">Insurance agent</td><td class="px-6 py-4 text-sm text-gray-500">Insurance I-33</td><td class="px-6 py-4 text-sm text-gray-500">03</td><td class="px-6 py-4 text-sm text-gray-500">NIMI</td></tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Total Books</h3>
                <p class="text-3xl font-bold text-blue-600">118</p>
                <p class="text-sm text-blue-700">Available Books</p>
              </div>
              <div class="bg-green-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-green-900 mb-2">Library Area</h3>
                <p class="text-3xl font-bold text-green-600">27.5</p>
                <p class="text-sm text-green-700">Square Meters</p>
              </div>
              <div class="bg-purple-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-purple-900 mb-2">Publisher</h3>
                <p class="text-3xl font-bold text-purple-600">NIMI</p>
                <p class="text-sm text-purple-700">Primary Publisher</p>
              </div>
            </div>
          </div>
        ', 'Library - S.N. ITI', 'Complete information about library facilities and available books at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 4, NULL, 0, '2025-06-18T08:38:24.378Z', '2025-06-19T05:16:55.561Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9myq000zfchspkqdd1br', 'Computer Lab', 'computer-lab', 'Information about our computer lab facilities and equipment.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Computer Lab</h2>
            <p class="mb-6">Our computer lab is equipped with modern computers and software to provide students with essential computer skills and digital literacy.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">Lab Specifications</h3>
                <ul class="text-blue-800 space-y-2">
                  <li>• Area: 380 Sq. Mt.</li>
                  <li>• Modern computer systems</li>
                  <li>• High-speed internet connectivity</li>
                  <li>• Latest software applications</li>
                  <li>• Multimedia capabilities</li>
                </ul>
              </div>
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Available Software</h3>
                <ul class="text-green-800 space-y-2">
                  <li>• Microsoft Office Suite</li>
                  <li>• CAD Software</li>
                  <li>• Programming Languages</li>
                  <li>• Educational Software</li>
                  <li>• Internet Browsers</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Computer Lab Gallery</h3>
              <p class="text-gray-700 mb-4">View our modern computer lab facilities:</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img src="/images/computer-lab/lab1.jpg" alt="Computer Lab View 1" class="rounded-lg shadow-sm" />
                <img src="/images/computer-lab/lab2.jpg" alt="Computer Lab View 2" class="rounded-lg shadow-sm" />
              </div>
            </div>
          </div>
        ', 'Computer Lab - S.N. ITI', 'Information about computer lab facilities and equipment at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 5, NULL, 0, '2025-06-18T08:38:24.386Z', '2025-06-19T05:20:04.803Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9myy0011fchsi84cnao2', 'Sports Activities', 'sports', 'Information about sports facilities and activities available at our institute.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Sports Activities</h2>
            <p class="mb-6">We believe in the overall development of our students, which includes physical fitness and sports activities.</p>
            
            <div class="overflow-x-auto mb-8">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of item available</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity(no.)</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr><td class="px-6 py-4 text-sm text-gray-500">1</td><td class="px-6 py-4 text-sm text-gray-900">Carom board</td><td class="px-6 py-4 text-sm text-gray-500">1</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">2</td><td class="px-6 py-4 text-sm text-gray-900">Chess</td><td class="px-6 py-4 text-sm text-gray-500">2</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">3</td><td class="px-6 py-4 text-sm text-gray-900">Badminton shuttles and net etc.</td><td class="px-6 py-4 text-sm text-gray-500">2 sets</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">4</td><td class="px-6 py-4 text-sm text-gray-900">Cricket bat, stumps, balls etc.</td><td class="px-6 py-4 text-sm text-gray-500">1 set</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">5</td><td class="px-6 py-4 text-sm text-gray-900">Volley ball</td><td class="px-6 py-4 text-sm text-gray-500">2</td></tr>
                  <tr><td class="px-6 py-4 text-sm text-gray-500">6</td><td class="px-6 py-4 text-sm text-gray-900">Net</td><td class="px-6 py-4 text-sm text-gray-500">1</td></tr>
                </tbody>
              </table>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-orange-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-orange-900 mb-2">Indoor Games</h3>
                <p class="text-2xl font-bold text-orange-600">3</p>
                <p class="text-sm text-orange-700">Carom, Chess, Table Tennis</p>
              </div>
              <div class="bg-blue-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Outdoor Games</h3>
                <p class="text-2xl font-bold text-blue-600">3</p>
                <p class="text-sm text-blue-700">Cricket, Badminton, Volleyball</p>
              </div>
              <div class="bg-green-50 p-6 rounded-lg text-center">
                <h3 class="text-lg font-semibold text-green-900 mb-2">Total Equipment</h3>
                <p class="text-2xl font-bold text-green-600">9</p>
                <p class="text-sm text-green-700">Sports Items Available</p>
              </div>
            </div>
          </div>
        ', 'Sports Activities - S.N. ITI', 'Information about sports facilities and activities available at S.N. Private Industrial Training Institute.', 'PUBLISHED', 'cmc1p9mxl000pfchsbf14pc1f', 6, NULL, 0, '2025-06-18T08:38:24.395Z', '2025-06-19T05:20:04.813Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mz60013fchs2ffql8nb', 'Contact', 'contact', 'Contact information and location details', NULL, 'Contact', 'Contact information and location details', 'PUBLISHED', NULL, 10, NULL, 0, '2025-06-18T08:38:24.402Z', '2025-06-18T08:38:24.402Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mze0015fchsg75zb5bt', 'Gallery', 'gallery', 'Photo gallery of institute activities', NULL, 'Gallery', 'Photo gallery of institute activities', 'PUBLISHED', NULL, 8, NULL, 0, '2025-06-18T08:38:24.410Z', '2025-06-18T08:38:24.410Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1p9mzm0017fchsjtjjsxjp', 'Feedback', 'feedback', 'Send your feedback, enquiries and grievances to us.', '
      <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 class="text-2xl font-bold mb-6">Feedback</h2>
        <p class="mb-6">We value your feedback and suggestions. Please use the form below to send us your enquiries and grievances.</p>
      </div>
    ', 'Feedback - S.N. ITI', 'Send your feedback, enquiries and grievances to S.N. Private Industrial Training Institute.', 'PUBLISHED', NULL, 9, NULL, 0, '2025-06-18T08:38:24.418Z', '2025-06-20T05:19:27.408Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc1zcufo0007fce8d9ppxhq9', 'Faculty (Technical Staff)', 'faculty', 'Information about our qualified technical staff and faculty members at S.N. Pvt. Industrial Training Institute.', '
          <div class="space-y-8">
            <div class="prose max-w-none">
              <p class="text-lg">
                Our institute is proud to have a team of qualified and experienced technical staff who are dedicated to providing quality education and training to our students.
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full border border-gray-300">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Designation</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Qualification</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Trade</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Date of Joining</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Job Type</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">CTI Trained</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">GAJENDRA SARAN</td>
                    <td class="border border-gray-300 px-4 py-2">INSTRUCTOR (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">NTC (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">ELECTRICIAN</td>
                    <td class="border border-gray-300 px-4 py-2">09 Apr. 2015</td>
                    <td class="border border-gray-300 px-4 py-2">Regular</td>
                    <td class="border border-gray-300 px-4 py-2">No</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">GOPI CHAND SARAN</td>
                    <td class="border border-gray-300 px-4 py-2">INSTRUCTOR (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">NTC (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">ELECTRICIAN</td>
                    <td class="border border-gray-300 px-4 py-2">21 Nov. 2024</td>
                    <td class="border border-gray-300 px-4 py-2">Regular</td>
                    <td class="border border-gray-300 px-4 py-2">No</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">GOPICHAND</td>
                    <td class="border border-gray-300 px-4 py-2">INSTRUCTOR (COPPA)</td>
                    <td class="border border-gray-300 px-4 py-2">NTC (COPPA)</td>
                    <td class="border border-gray-300 px-4 py-2">ELECTRICIAN</td>
                    <td class="border border-gray-300 px-4 py-2">01 JAN. 2025</td>
                    <td class="border border-gray-300 px-4 py-2">Regular</td>
                    <td class="border border-gray-300 px-4 py-2">No</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">SITA RAM SWAMAI</td>
                    <td class="border border-gray-300 px-4 py-2">INSTRUCTOR (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">NTC (ELECTRICIAN)</td>
                    <td class="border border-gray-300 px-4 py-2">ELECTRICIAN</td>
                    <td class="border border-gray-300 px-4 py-2">14 Dec. 2021</td>
                    <td class="border border-gray-300 px-4 py-2">Regular</td>
                    <td class="border border-gray-300 px-4 py-2">Yes</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-4 py-2 font-medium">VINOD KUMAR NAI</td>
                    <td class="border border-gray-300 px-4 py-2">Assistant Instructor</td>
                    <td class="border border-gray-300 px-4 py-2">NTC</td>
                    <td class="border border-gray-300 px-4 py-2">ELECTRICIAN</td>
                    <td class="border border-gray-300 px-4 py-2">11 Mar. 2024</td>
                    <td class="border border-gray-300 px-4 py-2">Regular</td>
                    <td class="border border-gray-300 px-4 py-2">No</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold mb-3">Faculty Qualifications</h3>
                <ul class="space-y-2">
                  <li>• All instructors hold National Trade Certificate (NTC) in their respective trades</li>
                  <li>• Regular faculty members with industry experience</li>
                  <li>• Continuous professional development programs</li>
                  <li>• CTI (Central Training Institute) training for selected faculty</li>
                </ul>
              </div>

              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold mb-3">Teaching Approach</h3>
                <ul class="space-y-2">
                  <li>• Practical hands-on training methodology</li>
                  <li>• Industry-relevant curriculum delivery</li>
                  <li>• Individual attention to each student</li>
                  <li>• Regular assessment and feedback</li>
                </ul>
              </div>
            </div>
          </div>
        ', NULL, NULL, 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-18T13:20:50.196Z', '2025-06-18T13:20:50.196Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc2xmfvc0001fcpgrvrl07bt', 'Achievements by Trainees', 'achievements', 'Student and institutional achievements and recognitions.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Achievements by Trainees</h2>
            <p class="mb-6">Our students have consistently achieved excellence in various fields and competitions.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div class="bg-yellow-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-yellow-900 mb-4">Academic Achievements</h3>
                <ul class="text-yellow-800 space-y-2">
                  <li>• High pass percentage in NCVT examinations</li>
                  <li>• Excellence in practical assessments</li>
                  <li>• Outstanding performance in trade competitions</li>
                  <li>• Recognition in skill development programs</li>
                </ul>
              </div>
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Employment Success</h3>
                <ul class="text-green-800 space-y-2">
                  <li>• High placement rate in industries</li>
                  <li>• Successful entrepreneurship ventures</li>
                  <li>• Recognition from employer organizations</li>
                  <li>• Career advancement of alumni</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-900 mb-4">Institutional Recognition</h3>
              <p class="text-blue-800 mb-4">Our institute has been recognized for:</p>
              <ul class="text-blue-800 space-y-2">
                <li>• Quality technical education delivery</li>
                <li>• Excellent infrastructure and facilities</li>
                <li>• Industry-institute collaboration</li>
                <li>• Student placement success</li>
                <li>• Compliance with NCVT standards</li>
              </ul>
            </div>
          </div>
        ', 'Student Achievements - S.N. ITI', 'Student and institutional achievements and recognitions at S.N. Private Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-19T05:20:04.822Z', '2025-06-19T05:20:04.822Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc2xmfvl0003fcpgicimjali', 'Progress Card', 'progress-card', 'Student progress tracking and report cards.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Progress Card</h2>
            <p class="mb-6">Track student progress and download progress reports for academic sessions.</p>

            <div class="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 class="text-lg font-semibold text-blue-900 mb-4">Available Progress Cards</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <div>
                    <h4 class="font-semibold text-gray-900">Sep. 2024 to March 2025</h4>
                    <p class="text-sm text-gray-600">Latest progress card for current academic session</p>
                  </div>
                  <a href="/downloads/Progress card.pdf" target="_blank"
                     class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Progress Tracking</h3>
                <ul class="text-green-800 space-y-2">
                  <li>• Monthly assessment reports</li>
                  <li>• Practical skill evaluation</li>
                  <li>• Attendance monitoring</li>
                  <li>• Theory examination results</li>
                  <li>• Overall performance analysis</li>
                </ul>
              </div>
              <div class="bg-yellow-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-yellow-900 mb-4">Report Features</h3>
                <ul class="text-yellow-800 space-y-2">
                  <li>• Detailed subject-wise marks</li>
                  <li>• Skill development progress</li>
                  <li>• Instructor feedback</li>
                  <li>• Improvement recommendations</li>
                  <li>• Parent-teacher communication</li>
                </ul>
              </div>
            </div>
          </div>
        ', 'Progress Card - S.N. ITI', 'Student progress tracking and report cards at S.N. Private Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-19T05:20:04.831Z', '2025-06-19T05:20:04.831Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc2xmfvs0005fcpgjvv2g26g', 'Administrative Staff', 'administrative-staff', 'Information about our administrative staff members.', '
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Administrative Staff</h2>
            <p class="mb-6">Meet our dedicated administrative staff who ensure smooth operations of the institute.</p>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Staff</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Joining</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Surendra Kumar</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Superintendent</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01-04-2017</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Amin Kaji</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pion</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01/10/2018</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">Administrative Functions</h3>
                <ul class="text-blue-800 space-y-2">
                  <li>• Student admission and records</li>
                  <li>• Academic administration</li>
                  <li>• Financial management</li>
                  <li>• Facility maintenance</li>
                  <li>• Government compliance</li>
                </ul>
              </div>
              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-lg font-semibold text-green-900 mb-4">Support Services</h3>
                <ul class="text-green-800 space-y-2">
                  <li>• Student counseling</li>
                  <li>• Career guidance</li>
                  <li>• Placement assistance</li>
                  <li>• Document verification</li>
                  <li>• General administration</li>
                </ul>
              </div>
            </div>
          </div>
        ', 'Administrative Staff - S.N. ITI', 'Information about administrative staff members at S.N. Private Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-19T05:20:04.839Z', '2025-06-19T05:20:04.839Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yrsst0001fcu0mu5ptk24', 'Trades Affilated To NCVT and SCVT', 'ncvt-scvt-affilated', 'Information about trades affiliated to NCVT and SCVT with seating capacity and syllabus details.', '<p>
      </p><h2>Trades Affilated To NCVT And SCVT</h2><p>
      </p><table class="border-collapse table-auto w-full border border-gray-300 table table-bordered" style="min-width: 325px"><colgroup><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"><col style="min-width: 25px"></colgroup><tbody><tr class="border border-gray-300"><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
        
          </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td></tr><tr class="border border-gray-300"><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>Trades linked with Syllabus</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>No. of Units</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>Shifts Running</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>Seating Capacity per Unit</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>Total Seating Capacity</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><th class="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium" colspan="1" rowspan="1"><p>Copy of DGET order link</p></th><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
          </p></td></tr><tr class="border border-gray-300"><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
        
        
          </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td></tr><tr class="border border-gray-300"><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p><a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 hover:text-blue-800 underline" href="https://www.ncvtonline.com/2022/10/iti-electrician-syllabus-download-in.html">ELECTRICIAN</a></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>6</p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>2</p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>20</p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>80</p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
            </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>Available on request</p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
          </p></td></tr><tr class="border border-gray-300"><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p>
        
      </p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td><td class="border border-gray-300 px-4 py-2" colspan="1" rowspan="1"><p></p></td></tr></tbody></table><p>
    </p>', 'Trades Affiliated to NCVT and SCVT - S.N. Pvt. ITI', 'Details of trades affiliated to NCVT and SCVT at S.N. Pvt. ITI including Electrician trade with seating capacity and syllabus information.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:27:46.830Z', '2025-06-20T16:28:32.712Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yrst40003fcu0xzrpu45x', 'Summary of Trades Affilated To NCVT', 'ncvt-affilated', 'Summary of trades affiliated to NCVT (National Council for Vocational Training) at the institute.', '
      <h2>Summary of Trades Affilated To NCVT</h2>
      <p>S.N. Pvt. Industrial Training Institute is affiliated to NCVT (National Council for Vocational Training) under the Directorate General of Employment & Training (DGE&T), Government of India.</p>

      <h3>NCVT Affiliated Trade:</h3>
      <ul>
        <li><strong>Electrician Trade</strong>
          <ul>
            <li>Duration: 2 Years</li>
            <li>Total Capacity: 126 seats</li>
            <li>Eligibility: 10th Pass</li>
            <li>Affiliation Year: 2009</li>
          </ul>
        </li>
      </ul>

      <p>The institute follows NCVT curriculum and examination pattern. Upon successful completion, students receive NCVT certificates which are recognized nationwide and provide better employment opportunities.</p>
    ', 'NCVT Affiliated Trades - S.N. Pvt. ITI', 'Summary of trades affiliated to NCVT at S.N. Pvt. ITI including Electrician trade with duration, capacity, and eligibility details.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:27:46.840Z', '2025-06-20T15:27:46.840Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yrsta0005fcu0hhf40nc3', 'Summary of Trades Affilated To SCVT', 'scvt-affilated', 'Summary of trades affiliated to SCVT (State Council for Vocational Training) at the institute.', '
      <h2>Summary of Trades Affilated To SCVT</h2>
      <p>Currently, S.N. Pvt. Industrial Training Institute does not have any trades affiliated to SCVT (State Council for Vocational Training).</p>

      <p>The institute is primarily focused on NCVT affiliated trades which provide national level recognition and better employment opportunities across India.</p>

      <p>For any future SCVT affiliations, the institute will update this information accordingly.</p>
    ', 'SCVT Affiliated Trades - S.N. Pvt. ITI', 'Information about SCVT affiliated trades at S.N. Pvt. ITI. Currently focused on NCVT trades for national recognition.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:27:46.847Z', '2025-06-20T15:27:46.847Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yu9ht0001fc68o1rz3se2', 'Trade Specific Infrastructure', 'ts-infrastructure', 'Detailed information about trade-specific infrastructure and equipment for Electrician trade.', '
      <h2>Trade Specific Infrastructure</h2>
      <h3>Electrician Trade Infrastructure</h3>
      
      <p>S.N. Pvt. Industrial Training Institute has well-equipped infrastructure specifically designed for Electrician trade training.</p>
      
      <h4>Workshop Equipment:</h4>
      <ul>
        <li>Electrical wiring boards and panels</li>
        <li>Motor control circuits</li>
        <li>Power distribution systems</li>
        <li>Measuring instruments and multimeters</li>
        <li>Hand tools and power tools</li>
        <li>Safety equipment and protective gear</li>
        <li>Electrical components and materials</li>
        <li>Testing and troubleshooting equipment</li>
      </ul>
      
      <h4>Training Facilities:</h4>
      <ul>
        <li>Dedicated electrician workshop area</li>
        <li>Individual workbenches for students</li>
        <li>Demonstration boards for practical learning</li>
        <li>Safety training area</li>
        <li>Tool storage and maintenance facility</li>
      </ul>
      
      <h4>Safety Measures:</h4>
      <ul>
        <li>Fire safety equipment</li>
        <li>First aid facilities</li>
        <li>Emergency shutdown systems</li>
        <li>Proper ventilation and lighting</li>
        <li>Safety protocols and guidelines</li>
      </ul>
      
      <p>All equipment and infrastructure meet NCVT standards and are regularly maintained to ensure optimal learning conditions.</p>
    ', 'Trade Specific Infrastructure - S.N. Pvt. ITI', 'Trade-specific infrastructure and equipment for Electrician trade at S.N. Pvt. ITI including workshop facilities and safety measures.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:29:41.777Z', '2025-06-20T15:29:41.777Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yvtdf0001fce4j6mc4opr', 'Achievements By Trainees', 'achievements-by-trainees', 'Outstanding achievements and accomplishments of trainees in academics, sports, and competitions.', '
      <h2>Achievements By Trainees</h2>
      <h3>Student Achievements and Accomplishments</h3>
      <p>S.N. Pvt. Industrial Training Institute takes pride in the achievements of its trainees in various fields.</p>
      
      <h4>Academic Achievements:</h4>
      <ul>
        <li>High pass percentage in NCVT examinations</li>
        <li>Merit positions in state-level competitions</li>
        <li>Excellence in practical training assessments</li>
        <li>Outstanding performance in trade theory</li>
      </ul>
      
      <h4>Technical Competitions:</h4>
      <ul>
        <li>Participation in skill development competitions</li>
        <li>Awards in technical exhibitions</li>
        <li>Recognition in innovation projects</li>
        <li>Success in inter-institute competitions</li>
      </ul>
      
      <h4>Employment Success:</h4>
      <ul>
        <li>High placement rates in reputed companies</li>
        <li>Successful entrepreneurship ventures</li>
        <li>Government job selections</li>
        <li>Higher education admissions</li>
      </ul>
      
      <h4>Sports and Cultural:</h4>
      <ul>
        <li>District level sports achievements</li>
        <li>Cultural program participations</li>
        <li>Leadership roles in student activities</li>
        <li>Community service initiatives</li>
      </ul>
      
      <p>The institute continues to support and encourage students to achieve excellence in all areas of development.</p>
    ', 'Student Achievements - S.N. Pvt. ITI', 'Outstanding achievements and accomplishments of trainees at S.N. Pvt. ITI in academics, technical competitions, and employment.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:30:54.195Z', '2025-06-20T15:30:54.195Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yvtdn0003fce44zpza4b7', 'Records of Trainees', 'records-of-trainees', 'Comprehensive records and documentation of trainee enrollment, progress, and completion details.', '
      <h2>Records of Trainees</h2>
      <h3>Trainee Record Management</h3>
      <p>S.N. Pvt. Industrial Training Institute maintains comprehensive records of all trainees for proper tracking and documentation.</p>
      
      <h4>Enrollment Records:</h4>
      <ul>
        <li>Student admission details</li>
        <li>Personal and academic information</li>
        <li>Document verification records</li>
        <li>Fee payment history</li>
        <li>Course allocation details</li>
      </ul>
      
      <h4>Academic Records:</h4>
      <ul>
        <li>Attendance records</li>
        <li>Assessment and examination results</li>
        <li>Practical training evaluations</li>
        <li>Progress reports</li>
        <li>Certificate issuance records</li>
      </ul>
      
      <h4>Training Progress:</h4>
      <ul>
        <li>Skill development tracking</li>
        <li>Workshop performance records</li>
        <li>Project completion status</li>
        <li>Industry exposure details</li>
        <li>Placement preparation records</li>
      </ul>
      
      <h4>Record Maintenance:</h4>
      <ul>
        <li>Digital and physical record keeping</li>
        <li>Regular updates and verification</li>
        <li>Secure storage and backup</li>
        <li>Easy retrieval system</li>
        <li>Confidentiality and privacy protection</li>
      </ul>
      
      <p>All trainee records are maintained as per NCVT guidelines and institutional policies.</p>
    ', 'Trainee Records - S.N. Pvt. ITI', 'Comprehensive trainee record management system at S.N. Pvt. ITI including enrollment, academic, and progress tracking.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:30:54.203Z', '2025-06-20T15:30:54.203Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkgi0001fcvs7rn6dopn', 'Attendance of Trainees', 'attendance-of-trainee', 'Trainee attendance tracking system and attendance records management.', '<h2>Attendance of Trainees</h2><p>S.N. Pvt. Industrial Training Institute maintains strict attendance records for all trainees as per NCVT guidelines.</p><h3>Attendance Policy:</h3><ul><li>Minimum 75% attendance required for examination eligibility</li><li>Daily attendance marking in theory and practical classes</li><li>Monthly attendance reports to parents/guardians</li><li>Regular monitoring and counseling for low attendance</li></ul><h3>Attendance System:</h3><ul><li>Digital attendance management system</li><li>Biometric attendance for accuracy</li><li>Real-time attendance tracking</li><li>Automated reports generation</li></ul>', 'Trainee Attendance - S.N. Pvt. ITI', 'Trainee attendance tracking system and attendance management at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.954Z', '2025-06-20T15:32:15.954Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkgq0003fcvs5dx23inx', 'Certificates Issued To Trainees', 'certificate-issued', 'Information about certificates issued to trainees upon successful completion of courses.', '<h2>Certificates Issued To Trainees</h2><p>S.N. Pvt. Industrial Training Institute issues NCVT certificates to successful trainees.</p><h3>Certificate Types:</h3><ul><li>NCVT Certificate for Electrician Trade</li><li>Course completion certificates</li><li>Skill development certificates</li><li>Participation certificates</li></ul><h3>Certificate Process:</h3><ul><li>Successful completion of 2-year course</li><li>Passing NCVT examinations</li><li>Meeting attendance requirements</li><li>Completion of practical training</li></ul>', 'Certificates Issued - S.N. Pvt. ITI', 'Information about NCVT and other certificates issued to trainees at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.962Z', '2025-06-20T16:18:06.500Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkh00005fcvseukib8s5', 'Energy Consumption', 'ee-consumption-pspm', 'Energy consumption monitoring and management per student per month.', '<h2>Energy Consumption</h2><p>Energy consumption monitoring and management system at the institute.</p><h3>Energy Management:</h3><ul><li>Monthly energy consumption tracking</li><li>Per student energy usage calculation</li><li>Energy conservation measures</li><li>Efficient equipment usage</li></ul><h3>Conservation Efforts:</h3><ul><li>LED lighting systems</li><li>Energy-efficient equipment</li><li>Solar power initiatives</li><li>Awareness programs</li></ul>', 'Energy Consumption - S.N. Pvt. ITI', 'Energy consumption monitoring and conservation efforts at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.972Z', '2025-06-20T15:32:15.972Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkh80007fcvsu0yq9nsl', 'Raw Material Consumption', 'rm-consumption-pspm', 'Raw material consumption tracking and management per student per month.', '<h2>Raw Material Consumption</h2><p>Raw material consumption tracking for training activities and workshops.</p><h3>Material Management:</h3><ul><li>Monthly raw material consumption tracking</li><li>Per student material usage calculation</li><li>Inventory management system</li><li>Cost-effective procurement</li></ul><h3>Materials Used:</h3><ul><li>Electrical components and wires</li><li>Tools and equipment</li><li>Safety materials</li><li>Consumable items</li></ul>', 'Raw Material Consumption - S.N. Pvt. ITI', 'Raw material consumption tracking and management at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.980Z', '2025-06-20T15:32:15.980Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkhh0009fcvslig8v6jn', 'Attendance of Instructor', 'attendance-instructor', 'Instructor attendance tracking and management system.', '<h2>Attendance of Instructor</h2><p>Regular attendance tracking for all instructors and teaching staff.</p><h3>Instructor Attendance:</h3><ul><li>Daily attendance marking</li><li>Monthly attendance reports</li><li>Leave management system</li><li>Substitute arrangements</li></ul><h3>Attendance Policy:</h3><ul><li>Regular working hours compliance</li><li>Professional commitment</li><li>Student welfare priority</li><li>Quality education delivery</li></ul>', 'Instructor Attendance - S.N. Pvt. ITI', 'Instructor attendance tracking and management system at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.989Z', '2025-06-20T15:32:15.989Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkho000bfcvsrtf81cld', 'Industry Institute Linkage', 'industry-linkages', 'Industry-institute collaboration and linkage programs for practical exposure.', '<h2>Industry Institute Linkage</h2><p>Strong industry partnerships for practical training and employment opportunities.</p><h3>Industry Partnerships:</h3><ul><li>Local electrical companies</li><li>Manufacturing industries</li><li>Service sector organizations</li><li>Government departments</li></ul><h3>Collaboration Activities:</h3><ul><li>Industrial visits and tours</li><li>Guest lectures by industry experts</li><li>Practical training programs</li><li>Placement assistance</li></ul>', 'Industry Linkage - S.N. Pvt. ITI', 'Industry-institute collaboration and linkage programs at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:15.997Z', '2025-06-20T15:32:15.997Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yxkhv000dfcvshxwntmzz', 'Name of the Industry Partner', 'industry-partner', 'List of industry partners collaborating with the institute for training and placement.', '<h2>Name of the Industry Partner</h2><p>Industry partners supporting training and placement activities.</p><h3>Partner Organizations:</h3><ul><li>Local electrical contractors</li><li>Power distribution companies</li><li>Manufacturing units</li><li>Service providers</li></ul><h3>Partnership Benefits:</h3><ul><li>Practical training opportunities</li><li>Industry exposure for students</li><li>Employment opportunities</li><li>Skill development programs</li></ul>', 'Industry Partners - S.N. Pvt. ITI', 'List of industry partners collaborating with S.N. Pvt. ITI for training and placement opportunities.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:32:16.003Z', '2025-06-20T15:32:16.003Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp2l0001fcrgbenoaghs', 'Major Activities / Contributions', 'major-activities', 'Major activities and contributions of industry partners in training and development.', '<h2>Major Activities / Contributions</h2><p>Industry partners contribute significantly to the training and development programs.</p><h3>Major Activities:</h3><ul><li>Guest lectures and workshops</li><li>Practical training sessions</li><li>Industry visits and exposure</li><li>Skill development programs</li><li>Placement assistance</li></ul><h3>Contributions:</h3><ul><li>Technical expertise sharing</li><li>Equipment and material support</li><li>Training infrastructure</li><li>Employment opportunities</li><li>Mentorship programs</li></ul>', 'Major Activities - S.N. Pvt. ITI', 'Major activities and contributions of industry partners at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.245Z', '2025-06-20T15:33:55.245Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp2u0003fcrggakq2rh8', 'Industry Visit / Industrial Tour', 'industry-visit', 'Industrial visits and tours organized for practical exposure and learning.', '<h2>Industry Visit / Industrial Tour</h2><p>Regular industrial visits provide practical exposure to students.</p><h3>Visit Objectives:</h3><ul><li>Practical industry exposure</li><li>Understanding work environment</li><li>Learning latest technologies</li><li>Career guidance and counseling</li></ul><h3>Visit Activities:</h3><ul><li>Factory floor observations</li><li>Interaction with professionals</li><li>Understanding production processes</li><li>Safety protocol learning</li></ul>', 'Industry Visits - S.N. Pvt. ITI', 'Industrial visits and tours organized for practical exposure at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.254Z', '2025-06-20T15:33:55.254Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp330005fcrgnmyn1zat', 'Guest Faculty', 'guest-faculty', 'Guest faculty and industry experts contributing to specialized training programs.', '<h2>Guest Faculty</h2><p>Industry experts and guest faculty enhance the learning experience with specialized knowledge.</p><h3>Guest Faculty Contributions:</h3><ul><li>Specialized technical sessions</li><li>Industry best practices sharing</li><li>Latest technology updates</li><li>Career guidance sessions</li></ul><h3>Expert Areas:</h3><ul><li>Advanced electrical systems</li><li>Industrial automation</li><li>Safety protocols</li><li>Entrepreneurship development</li></ul>', 'Guest Faculty - S.N. Pvt. ITI', 'Guest faculty and industry experts contributing to specialized training at S.N. Pvt. ITI.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.263Z', '2025-06-20T15:33:55.263Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp3c0007fcrgm40psln7', 'Workshop & Seminars', 'workshop-seminar', 'Workshops and seminars organized for skill enhancement and knowledge sharing.', '<h2>Workshop & Seminars</h2><p>Regular workshops and seminars for continuous learning and skill development.</p><h3>Workshop Topics:</h3><ul><li>Advanced electrical techniques</li><li>Safety in electrical work</li><li>New technology trends</li><li>Entrepreneurship development</li></ul><h3>Seminar Benefits:</h3><ul><li>Knowledge enhancement</li><li>Skill upgradation</li><li>Industry networking</li><li>Career development</li></ul>', 'Workshops & Seminars - S.N. Pvt. ITI', 'Workshops and seminars organized for skill enhancement at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.272Z', '2025-06-20T15:33:55.272Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp3k0009fcrgymlefwkg', 'Activities', 'activities', 'Various co-curricular and extracurricular activities organized at the institute.', '<h2>Activities</h2><p>Various activities for overall development of students beyond academics.</p><h3>Co-curricular Activities:</h3><ul><li>Technical exhibitions</li><li>Project presentations</li><li>Skill competitions</li><li>Educational tours</li></ul><h3>Extracurricular Activities:</h3><ul><li>Sports competitions</li><li>Cultural programs</li><li>Social service activities</li><li>Environmental awareness programs</li></ul>', 'Student Activities - S.N. Pvt. ITI', 'Co-curricular and extracurricular activities organized at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.280Z', '2025-06-20T15:33:55.280Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp3q000bfcrg8kd444jk', 'RTI', 'rti', 'Right to Information (RTI) procedures and information access guidelines.', '<h2>Right to Information (RTI)</h2><p>Information access procedures as per RTI Act 2005.</p><h3>RTI Guidelines:</h3><ul><li>Information request procedures</li><li>Designated RTI officer</li><li>Response timeframes</li><li>Appeal procedures</li></ul><h3>Available Information:</h3><ul><li>Institute policies and procedures</li><li>Admission and fee details</li><li>Faculty and staff information</li><li>Infrastructure and facilities</li></ul>', 'RTI Information - S.N. Pvt. ITI', 'Right to Information (RTI) procedures and guidelines at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.286Z', '2025-06-20T15:33:55.286Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp3x000dfcrguazghsod', 'Inspection Details', 'inspection-details', 'Government inspection details and compliance reports.', '<h2>Inspection Details</h2><p>Regular government inspections ensure quality and compliance.</p><h3>Inspection Types:</h3><ul><li>NCVT compliance inspections</li><li>DTE Rajasthan inspections</li><li>Safety and infrastructure audits</li><li>Academic quality assessments</li></ul><h3>Compliance Areas:</h3><ul><li>Infrastructure standards</li><li>Faculty qualifications</li><li>Training quality</li><li>Student welfare</li></ul>', 'Inspection Details - S.N. Pvt. ITI', 'Government inspection details and compliance reports at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.294Z', '2025-06-20T15:33:55.294Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp44000ffcrg3aaw7xe8', 'State Directorate', 'state-directorate', 'Information about State Directorate of Technical Education and its guidelines.', '<h2>State Directorate</h2><p>Affiliation and compliance with Directorate of Technical Education, Rajasthan.</p><h3>Directorate Information:</h3><ul><li>Directorate of Technical Education, Jodhpur</li><li>Government of Rajasthan</li><li>Technical education oversight</li><li>Policy implementation</li></ul><h3>Compliance Areas:</h3><ul><li>Admission procedures</li><li>Curriculum implementation</li><li>Examination conduct</li><li>Quality assurance</li></ul>', 'State Directorate - S.N. Pvt. ITI', 'Information about State Directorate of Technical Education and compliance at S.N. Pvt. ITI.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.300Z', '2025-06-20T15:33:55.300Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp4b000hfcrgfu6bi9ue', 'Certificate ISO', 'iso-certificate', 'ISO certification details and quality management system information.', '<h2>ISO Certificate</h2><p>Quality management system certification and standards compliance.</p><h3>Quality Standards:</h3><ul><li>ISO quality management system</li><li>Continuous improvement processes</li><li>Quality assurance measures</li><li>Standard operating procedures</li></ul><h3>Benefits:</h3><ul><li>Enhanced training quality</li><li>Systematic processes</li><li>Continuous improvement</li><li>Stakeholder confidence</li></ul>', 'ISO Certificate - S.N. Pvt. ITI', 'ISO certification and quality management system at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.307Z', '2025-06-20T15:33:55.307Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4yzp4i000jfcrgebmsw2ii', 'Funds Status', 'fund-status', 'Financial status and fund utilization details of the institute.', '<h2>Funds Status</h2><p>Financial management and fund utilization transparency.</p><h3>Fund Sources:</h3><ul><li>Student fees</li><li>Government grants</li><li>Industry partnerships</li><li>Other income sources</li></ul><h3>Fund Utilization:</h3><ul><li>Infrastructure development</li><li>Equipment procurement</li><li>Staff salaries</li><li>Operational expenses</li></ul>', 'Fund Status - S.N. Pvt. ITI', 'Financial status and fund utilization details at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:33:55.314Z', '2025-06-20T15:33:55.314Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4z0tz50001fcxglyu5wwj7', 'DGET And State Govt. Orders', 'dget-orders', 'DGET and State Government orders, circulars, and policy documents.', '<h2>DGET And State Govt. Orders</h2><p>Important orders and circulars from DGET and State Government.</p><h3>DGET Orders:</h3><ul><li>Affiliation orders and renewals</li><li>Curriculum updates and guidelines</li><li>Examination procedures</li><li>Quality assurance directives</li></ul><h3>State Government Orders:</h3><ul><li>Policy implementations</li><li>Admission guidelines</li><li>Fee structure approvals</li><li>Regulatory compliance</li></ul>', 'DGET Orders - S.N. Pvt. ITI', 'DGET and State Government orders, circulars, and policy documents at S.N. Pvt. ITI.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:34:48.257Z', '2025-06-20T15:34:48.257Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4z0tzf0003fcxg7zr8qb6u', 'Rating Of Institute', 'ratting', 'Institute rating and performance evaluation by regulatory authorities.', '<h2>Rating Of Institute</h2><p>Performance evaluation and rating by regulatory authorities.</p><h3>Rating Parameters:</h3><ul><li>Infrastructure quality</li><li>Faculty qualifications</li><li>Training effectiveness</li><li>Student outcomes</li><li>Industry linkages</li></ul><h3>Performance Indicators:</h3><ul><li>Pass percentage in examinations</li><li>Placement rates</li><li>Industry feedback</li><li>Student satisfaction</li></ul>', 'Institute Rating - S.N. Pvt. ITI', 'Institute rating and performance evaluation at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:34:48.267Z', '2025-06-20T15:34:48.267Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4z0tzo0005fcxgzwi75dkq', 'Grievance Redressal Mechanism', 'grm', 'Grievance redressal mechanism and complaint handling procedures.', '<h2>Grievance Redressal Mechanism</h2><p>Systematic approach to address student and stakeholder grievances.</p><h3>Grievance Categories:</h3><ul><li>Academic issues</li><li>Administrative matters</li><li>Infrastructure concerns</li><li>Fee-related queries</li></ul><h3>Redressal Process:</h3><ul><li>Complaint registration</li><li>Investigation and review</li><li>Resolution and feedback</li><li>Follow-up and monitoring</li></ul>', 'Grievance Redressal - S.N. Pvt. ITI', 'Grievance redressal mechanism and complaint handling at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:34:48.276Z', '2025-06-20T15:34:48.276Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4z0tzw0007fcxgoozolwty', 'Maintenance Expenditure', 'building-maintenance', 'Building and infrastructure maintenance expenditure details.', '<h2>Maintenance Expenditure</h2><p>Regular maintenance and upkeep of infrastructure and facilities.</p><h3>Maintenance Areas:</h3><ul><li>Building and structural maintenance</li><li>Equipment servicing and repairs</li><li>Electrical and plumbing systems</li><li>Safety equipment maintenance</li></ul><h3>Expenditure Categories:</h3><ul><li>Preventive maintenance</li><li>Corrective maintenance</li><li>Emergency repairs</li><li>Upgradation and improvements</li></ul>', 'Maintenance Expenditure - S.N. Pvt. ITI', 'Building and infrastructure maintenance expenditure at S.N. Pvt. Industrial Training Institute.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:34:48.284Z', '2025-06-20T15:34:48.284Z', 'cmc1p577i0000fcy4iafh42k2');
INSERT INTO "pages" ("id", "title", "slug", "description", "content", "metaTitle", "metaDesc", "status", "parentId", "order", "navigationCategory", "navigationOrder", "createdAt", "updatedAt", "createdById") VALUES ('cmc4z0u050009fcxg8whkda9v', 'Site Map', 'sitemap', 'Complete site map showing all pages and sections of the website.', '<h2>Site Map</h2><p>Complete navigation structure of the S.N. Pvt. ITI website.</p><h3>Main Sections:</h3><ul><li><strong>Home</strong> - Welcome page</li><li><strong>About Us</strong><ul><li>About Institute</li><li>Introduction of Institute</li><li>Scheme Running</li></ul></li><li><strong>Admissions</strong><ul><li>Admission Criteria</li><li>NCVT/SCVT Affiliated Trades</li><li>Application Format</li><li>Fee Structure</li></ul></li><li><strong>Facilities</strong><ul><li>Infrastructure</li><li>Computer Lab</li><li>Library</li><li>Sports</li></ul></li><li><strong>Trainee</strong><ul><li>Achievements</li><li>Records</li><li>Placements</li><li>Results</li></ul></li><li><strong>Staff</strong><ul><li>Faculty</li><li>Administrative Staff</li></ul></li><li><strong>More</strong><ul><li>Industry Linkage</li><li>Activities</li><li>RTI</li></ul></li><li><strong>Gallery</strong></li><li><strong>Contact</strong></li></ul>', 'Site Map - S.N. Pvt. ITI', 'Complete site map and navigation structure of S.N. Pvt. Industrial Training Institute website.', 'PUBLISHED', NULL, 0, NULL, 0, '2025-06-20T15:34:48.294Z', '2025-06-20T15:34:48.294Z', 'cmc1p577i0000fcy4iafh42k2');

-- navigation_items
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-home', 'Home', '/', NULL, 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.894Z', '2025-06-20T14:36:18.306Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-about', 'About Us', NULL, NULL, 1, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.903Z', '2025-06-20T14:21:57.903Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-about-institute', 'About Institute', '/about-institute', 'nav-about', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.915Z', '2025-06-20T14:21:57.915Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-about-intro', 'Introduction of Institute', '/introduction-institute', 'nav-about', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.922Z', '2025-06-20T14:21:57.922Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-about-scheme', 'Scheme Running in The Institute', '/scheme-running', 'nav-about', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.933Z', '2025-06-20T14:21:57.933Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions', 'Admissions', NULL, NULL, 2, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.943Z', '2025-06-20T14:21:57.943Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-criteria', 'Admission Criteria', '/admission-criteria', 'nav-admissions', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.951Z', '2025-06-20T14:21:57.951Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-ncvt-scvt', 'Trades Affilated To NCVT and SCVT', '/ncvt-scvt-affilated', 'nav-admissions', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.961Z', '2025-06-20T14:21:57.961Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-ncvt', 'Summary of Trades Affilated To NCVT', '/ncvt-affilated', 'nav-admissions', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.968Z', '2025-06-20T14:21:57.968Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-scvt', 'Summary of Trades Affilated To SCVT', '/scvt-affilated', 'nav-admissions', 3, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.975Z', '2025-06-20T14:21:57.975Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-format', 'Application Format', '/application-format', 'nav-admissions', 4, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.982Z', '2025-06-20T14:21:57.982Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-admissions-fee', 'Fee Structure', '/fee-structure', 'nav-admissions', 5, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.987Z', '2025-06-20T14:21:57.987Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities', 'Facilities', NULL, NULL, 3, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:57.995Z', '2025-06-20T14:21:57.995Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-infra', 'Infrastructure,Buliding and Workshop', '/infrastructure', 'nav-facilities', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.001Z', '2025-06-20T14:21:58.001Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-ts', 'Trade Specific Infrastructure', '/ts-infrastructure', 'nav-facilities', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.007Z', '2025-06-20T14:21:58.007Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-power', 'Electric Power Supply', '/electric-power', 'nav-facilities', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.013Z', '2025-06-20T14:21:58.013Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-library', 'Library', '/library', 'nav-facilities', 3, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.020Z', '2025-06-20T14:21:58.020Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-lab', 'Computer lab', '/computer-lab', 'nav-facilities', 4, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.025Z', '2025-06-20T14:21:58.025Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-facilities-sports', 'Sports', '/sports', 'nav-facilities', 5, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.031Z', '2025-06-20T14:21:58.031Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee', 'Trainee', NULL, NULL, 4, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.037Z', '2025-06-20T14:21:58.037Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-achievements', 'Achievements By Trainees', '/achievements-by-trainees', 'nav-trainee', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.043Z', '2025-06-20T14:21:58.043Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-records', 'Records of Trainees', '/records-of-trainees', 'nav-trainee', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.048Z', '2025-06-20T14:21:58.048Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-attendance', 'Attendance of Trainees', '/attendance-of-trainee', 'nav-trainee', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.057Z', '2025-06-20T14:21:58.057Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-certificates', 'Certificates Issued To Trainees', '/certificate-issued', 'nav-trainee', 3, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.062Z', '2025-06-20T14:21:58.062Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-progress', 'PROGRESS CARD', '/progress-card', 'nav-trainee', 4, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.069Z', '2025-06-20T14:21:58.069Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-placements', 'Placements', '/placements', 'nav-trainee', 5, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.075Z', '2025-06-20T14:21:58.075Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-results', 'Results', '/results', 'nav-trainee', 6, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.082Z', '2025-06-20T14:21:58.082Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-energy', 'Energy Consumption', '/ee-consumption-pspm', 'nav-trainee', 7, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.088Z', '2025-06-20T14:21:58.088Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-trainee-material', 'Raw Material Consumption', '/rm-consumption-pspm', 'nav-trainee', 8, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.094Z', '2025-06-20T14:21:58.094Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-staff', 'Staff', NULL, NULL, 5, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.102Z', '2025-06-20T14:21:58.102Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-staff-faculty', 'Faculty', '/faculty', 'nav-staff', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.108Z', '2025-06-20T14:21:58.108Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-staff-admin', 'Administrative Staff', '/administrative-staff', 'nav-staff', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.117Z', '2025-06-20T14:21:58.117Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-staff-attendance', 'Attendance of Instructor', '/attendance-instructor', 'nav-staff', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.124Z', '2025-06-20T14:21:58.124Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more', 'More', NULL, NULL, 6, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.130Z', '2025-06-20T14:21:58.130Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry', 'Industry Institute linkage', '/industry-linkages', 'nav-more', 0, true, 'dropdown', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.136Z', '2025-06-20T14:21:58.136Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry-partner', 'Name of the Industry Partner', '/industry-partner', 'nav-more-industry', 0, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.143Z', '2025-06-20T14:21:58.143Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry-activities', 'Major Activities / Contributions', '/major-activities', 'nav-more-industry', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.149Z', '2025-06-20T14:21:58.149Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry-visit', 'Industry Visit / Industrial Tour', '/industry-visit', 'nav-more-industry', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.158Z', '2025-06-20T14:21:58.158Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry-faculty', 'Guest Faculty', '/guest-faculty', 'nav-more-industry', 3, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.165Z', '2025-06-20T14:21:58.165Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-industry-workshop', 'Workshop & Seminars', '/workshop-seminar', 'nav-more-industry', 4, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.171Z', '2025-06-20T14:21:58.171Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-activities', 'Activities', '/activities', 'nav-more', 1, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.177Z', '2025-06-20T14:21:58.177Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-rti', 'RTI', '/rti', 'nav-more', 2, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.183Z', '2025-06-20T14:21:58.183Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-inspection', 'Inspection Details', '/inspection-details', 'nav-more', 3, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.188Z', '2025-06-20T14:21:58.188Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-directorate', 'State Directorate', '/state-directorate', 'nav-more', 4, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.197Z', '2025-06-20T14:21:58.197Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-iso', 'Certificate ISO', '/iso-certificate', 'nav-more', 5, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.203Z', '2025-06-20T14:21:58.203Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-funds', 'Funds Status', '/fund-status', 'nav-more', 6, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.210Z', '2025-06-20T14:21:58.210Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-orders', 'DGET And State Govt. Orders', '/dget-orders', 'nav-more', 7, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.215Z', '2025-06-20T14:21:58.215Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-rating', 'Rating Of Institute', '/ratting', 'nav-more', 8, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.222Z', '2025-06-20T14:21:58.222Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-grievance', 'Grievance Redressal Mechanism', '/grm', 'nav-more', 9, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.227Z', '2025-06-20T14:21:58.227Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-more-maintenance', 'Maintenance Expenditure', '/building-maintenance', 'nav-more', 10, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.233Z', '2025-06-20T14:21:58.233Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-gallery', 'Gallery', '/gallery', NULL, 7, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.241Z', '2025-06-20T14:21:58.241Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-feedback', 'Feedback', '/feedback', NULL, 8, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.247Z', '2025-06-20T14:21:58.247Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-contact', 'Contact', '/contact', NULL, 9, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.257Z', '2025-06-20T14:21:58.257Z');
INSERT INTO "navigation_items" ("id", "title", "href", "parentId", "order", "isVisible", "linkType", "target", "description", "icon", "cssClass", "createdAt", "updatedAt") VALUES ('nav-sitemap', 'Site Map', '/sitemap', NULL, 10, true, 'internal', '_self', NULL, NULL, NULL, '2025-06-20T14:21:58.268Z', '2025-06-20T14:21:58.268Z');

-- _prisma_migrations
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('067d335c-d3da-4597-90db-d381e889ad0c', 'fb9dbf14bff74aadcaa646d088bf20cec42073a104fbb3487f0e88f29934c283', '2025-06-18T08:33:36.845Z', '20250618083336_init', NULL, NULL, '2025-06-18T08:33:36.804Z', 1);

-- Re-enable foreign key checks
SET session_replication_role = 'origin';