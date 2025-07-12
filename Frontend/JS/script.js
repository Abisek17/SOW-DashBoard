        const mainContent = document.getElementById('main-content');
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        const messageBox = document.getElementById('messageBox');

        // Base URL for your Spring Boot backend
        const API_BASE_URL = 'https://sow-dashboard.onrender.com/api';

        // Function to show messages (success/error)
        function showMessage(message, isError = false) {
            messageBox.textContent = message;
            messageBox.className = 'message-box'; // Reset classes
            if (isError) {
                messageBox.classList.add('error');
            }
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 3000); // Hide after 3 seconds
        }

        // API Service functions
        const apiService = {
            async getOpportunities() {
                try {
                    console.log('Attempting to fetch opportunities from:', `${API_BASE_URL}/opportunities`);
                    const response = await fetch(`${API_BASE_URL}/opportunities`);
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                    }
                    const data = await response.json();
                    console.log('Successfully fetched opportunities:', data);
                    return data;
                } catch (error) {
                    console.error('Error fetching opportunities:', error);
                    showMessage(`Failed to load opportunities: ${error.message}`, true);
                    return [];
                }
            },

            async createOpportunity(opportunityData) {
                try {
                    console.log('Attempting to create opportunity with data:', opportunityData);
                    const response = await fetch(`${API_BASE_URL}/opportunities`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(opportunityData),
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                    }
                    const newOpp = await response.json();
                    console.log('Successfully created opportunity:', newOpp);
                    return newOpp;
                } catch (error) {
                    console.error('Error creating opportunity:', error);
                    showMessage(`Failed to add opportunity: ${error.message}`, true);
                    throw error; // Re-throw to allow form to handle
                }
            }
        };

        // Function to render opportunities table
        function renderOpportunitiesTable(opportunities, tableId, isRecent = false) {
            console.log(`renderOpportunitiesTable called for ID: ${tableId}, isRecent: ${isRecent}`);
            console.log('Opportunities to render:', opportunities);

            // Corrected: Use getElementById directly as the ID is on the tbody
            const tableBody = document.getElementById(tableId);
            if (!tableBody) {
                console.error(`Error: tbody element with ID '${tableId}' not found.`);
                return;
            }

            tableBody.innerHTML = ''; // Clear existing rows

            if (opportunities.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-gray-500">No opportunities found.</td></tr>';
                console.log('No opportunities to display.');
                return;
            }

            opportunities.forEach(opportunity => {
                const row = document.createElement('tr');
                const createdDate = opportunity.createdDate ? new Date(opportunity.createdDate).toLocaleString() : 'N/A';
                // Determine statusClass based on 'status' or 'progress'
                const statusValue = opportunity.status || opportunity.progress;
                const statusClass = {
                    'Awarded': 'status-awarded',
                    'Rejected': 'status-rejected',
                    'On Negotiation': 'status-negotiation',
                    '50%': 'status-progress',
                    '75%': 'status-progress',
                    '25%': 'status-progress',
                    '90%': 'status-progress'
                }[statusValue] || ''; // Default to empty string if no match

                console.log('Processing opportunity:', opportunity);
                console.log('Status/Progress value:', statusValue, '-> statusClass:', statusClass);


                if (isRecent) {
                    // For Recent Opportunities table (Dashboard)
                    row.innerHTML = `
                        <td>${opportunity.projectName || 'N/A'}</td>
                        <td>${opportunity.partner || 'N/A'}</td>
                        <td>${createdDate}</td>
                        <td><span class="status-badge ${statusClass}">${opportunity.progress || 'N/A'}</span></td>
                        <td><button class="text-blue-500 hover:underline text-sm">Continue</button></td>
                    `;
                } else {
                    // For All Opportunities table (Opportunities Details)
                    row.innerHTML = `
                        <td>${opportunity.id || 'N/A'}</td>
                        <td>${opportunity.salesRep || 'N/A'}</td>
                        <td>${opportunity.partner || 'N/A'}</td>
                        <td>${opportunity.endCustomer || 'N/A'}</td>
                        <td>${opportunity.category || 'N/A'}</td>
                        <td>${opportunity.subject || 'N/A'}</td>
                        <td>${opportunity.type || 'N/A'}</td>
                        <td><span class="status-badge ${statusClass}">${opportunity.status || 'N/A'}</span></td>
                        <td><button class="text-blue-500 hover:underline text-sm">View</button></td>
                    `;
                }
                tableBody.appendChild(row);
            });
        }

        // Function to render the opportunities report chart
        function renderOpportunitiesChart(opportunities) {
            const ctx = document.getElementById('opportunitiesChart');
            if (!ctx) {
                console.error('Error: Canvas element with ID "opportunitiesChart" not found.');
                return;
            }

            // Prepare data for the chart
            const monthlyData = {};
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentYear = new Date().getFullYear(); // Assuming current year for simplicity

            // Initialize monthly data for the last 6 months (Dec 2024 - May 2025 as per PDF)
            // Adjusting to cover Dec of previous year to May of current year
            for (let i = 0; i < 6; i++) {
                let monthOffset = 5 - i; // 5 for May, 4 for Apr, ..., 0 for Dec (relative to May)
                let targetMonthIndex = (new Date().getMonth() - monthOffset + 12) % 12;
                let targetYear = currentYear;
                if (new Date().getMonth() - monthOffset < 0) { // If month goes into previous year
                    targetYear--;
                }
                monthlyData[`${months[targetMonthIndex]} ${targetYear}`] = 0;
            }

            // Sort labels chronologically
            const sortedLabels = Object.keys(monthlyData).sort((a, b) => {
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                const dateA = new Date(`${monthA} 1, ${yearA}`);
                const dateB = new Date(`${monthB} 1, ${yearB}`);
                return dateA - dateB;
            });

            // Re-order monthlyData based on sortedLabels
            const orderedMonthlyData = {};
            sortedLabels.forEach(label => {
                orderedMonthlyData[label] = monthlyData[label];
            });


            opportunities.forEach(opp => {
                if (opp.createdDate) {
                    const date = new Date(opp.createdDate);
                    const month = months[date.getMonth()];
                    const year = date.getFullYear();
                    const key = `${month} ${year}`;
                    if (orderedMonthlyData.hasOwnProperty(key)) { // Only count for the months we are tracking
                        orderedMonthlyData[key]++;
                    }
                }
            });

            const labels = Object.keys(orderedMonthlyData);
            const dataValues = Object.values(orderedMonthlyData);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Opportunities Created',
                        data: dataValues,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind blue-500 with opacity
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0 // Ensure integer ticks for count
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // Hide legend if only one dataset
                        }
                    }
                }
            });
        }

        // Function to calculate and display total cost
        function calculateTotalCost() {
            const serviceItemRows = document.querySelectorAll('#serviceItemsTableBody tr');
            let subtotal = 0;

            serviceItemRows.forEach(row => {
                const unitsInput = row.querySelector('.units-input');
                const costInput = row.querySelector('.cost-input');

                const units = parseFloat(unitsInput ? unitsInput.value : 0) || 0;
                const cost = parseFloat(costInput ? costInput.value : 0) || 0;

                subtotal += units * cost;
            });

            const risk = parseFloat(document.getElementById('risk').value) || 0;
            const discount = parseFloat(document.getElementById('discount').value) || 0;
            const cancellationFee = parseFloat(document.getElementById('cancellationFee').value) || 0;

            let totalCost = subtotal;

            totalCost += totalCost * (risk / 100);
            totalCost -= totalCost * (discount / 100);
            totalCost += totalCost * (cancellationFee / 100); // Cancellation fee is usually an addition

            document.getElementById('totalCostToCustomerSpan').textContent = `$${totalCost.toFixed(2)}`;
        }

        // Function to add a new service item row
        let serviceItemCounter = 0; // To ensure unique names for new inputs
        function addServiceItemRow() {
            serviceItemCounter++;
            const tableBody = document.getElementById('serviceItemsTableBody');
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-item-id', `new-${serviceItemCounter}`); // Unique ID for the row

            newRow.innerHTML = `
                <td><input type="text" value="" class="w-full p-1 border rounded-md" name="serviceType_new_${serviceItemCounter}" placeholder="Service Type"></td>
                <td><input type="text" value="" class="w-full p-1 border rounded-md" name="description_new_${serviceItemCounter}" placeholder="Description"></td>
                <td><input type="text" value="" class="w-full p-1 border rounded-md" name="deliveryMode_new_${serviceItemCounter}" placeholder="Delivery Mode"></td>
                <td><input type="number" value="0" min="0" class="w-full p-1 border rounded-md units-input" name="units_new_${serviceItemCounter}"></td>
                <td><input type="number" value="0" min="0" step="0.01" class="w-full p-1 border rounded-md cost-input" name="costToCustomer_new_${serviceItemCounter}"></td>
                <td><input type="text" value="NA" class="w-full p-1 border rounded-md" name="migrationDC_new_${serviceItemCounter}" placeholder="Migration DC"></td>
                <td><input type="text" value="NA" class="w-full p-1 border rounded-md" name="migrationProv_new_${serviceItemCounter}" placeholder="Migration Provisioning"></td>
                <td><input type="text" value="Per Unit" class="w-full p-1 border rounded-md" name="unitDef_new_${serviceItemCounter}" placeholder="Unit Definition"></td>
                <td><input type="number" value="0" min="0" class="w-full p-1 border rounded-md" name="minReq_new_${serviceItemCounter}" placeholder="Min. # req"></td>
                <td><button type="button" class="text-red-500 hover:underline text-sm delete-item-btn">Delete</button></td>
            `;
            tableBody.appendChild(newRow);

            // Add event listeners to the new inputs and delete button
            newRow.querySelector('.units-input').addEventListener('input', calculateTotalCost);
            newRow.querySelector('.cost-input').addEventListener('input', calculateTotalCost);
            newRow.querySelector('.delete-item-btn').addEventListener('click', (e) => {
                e.target.closest('tr').remove();
                calculateTotalCost(); // Recalculate after deletion
            });
        }


        // Page content definitions
        const pages = {
            dashboard: async () => {
                let content = `
                    <div class="header">
                        <h1>Dashboard</h1>
                        <button class="button-primary" onclick="loadPage('add-opportunity')">+ Add New Opportunity</button>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">Total Opportunities</div>
                        </div>
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">Awarded Opportunities</div>
                        </div>
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">Rejected Opportunities</div>
                        </div>
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">Opportunities On Hold</div>
                        </div>
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">No. of Partners</div>
                        </div>
                        <div class="stat-card">
                            <div class="value">--</div>
                            <div class="label">No. of Customers</div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h2>Opportunities Report</h2>
                            <span class="text-sm text-gray-500">Dec 2024 - May 2025</span>
                        </div>
                        <div class="relative h-64"> <!-- Added relative and height for canvas -->
                            <canvas id="opportunitiesChart"></canvas>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h2>Recent Opportunities</h2>
                            <a href="#opportunities-details" class="text-blue-500 hover:underline text-sm" data-page="opportunities-details">View All</a>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th>Partner</th>
                                        <th>Created Date</th>
                                        <th>Progress</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="recentOpportunitiesTableBody">
                                    <tr><td colspan="5" class="text-center py-4 text-gray-500">Loading opportunities...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                mainContent.innerHTML = content;

                // Fetch opportunities once for both table and chart
                const opportunities = await apiService.getOpportunities();
                console.log('Opportunities for Recent Table (sliced):', opportunities.slice(0, 4));
                renderOpportunitiesTable(opportunities.slice(0, 4), 'recentOpportunitiesTableBody', true); // Show first 4 recent ops

                // Render the chart
                renderOpportunitiesChart(opportunities);

                // Update stats
                document.querySelector('.stat-card:nth-child(1) .value').textContent = opportunities.length;
                document.querySelector('.stat-card:nth-child(2) .value').textContent = opportunities.filter(o => o.status === 'Awarded').length;
                document.querySelector('.stat-card:nth-child(3) .value').textContent = opportunities.filter(o => o.status === 'Rejected').length;
                document.querySelector('.stat-card:nth-child(4) .value').textContent = opportunities.filter(o => o.status === 'On Negotiation').length;
                document.querySelector('.stat-card:nth-child(5) .value').textContent = new Set(opportunities.map(o => o.partner)).size;
                document.querySelector('.stat-card:nth-child(6) .value').textContent = new Set(opportunities.map(o => o.endCustomer)).size;
            },
            'sow-editing': `
                <div class="header">
                    <h1>SOW Editing</h1>
                    <div class="flex space-x-3">
                        <button class="button-secondary" onclick="loadPage('dashboard')">X Close</button>
                        <button class="button-secondary" type="submit" form="sowEditingForm">Save</button>
                        <button class="button-primary" onclick="loadPage('cost-calculation')">Next Step &rarr;</button>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-card-header">
                        <h2>Basic Details</h2>
                    </div>
                    <form id="sowEditingForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="partnerName">Partner Name</label>
                                <select id="partnerName" name="partner">
                                    <option value="">Choose Partner</option>
                                    <option value="WWT">WWT</option>
                                    <option value="Virtual Tech Gurus, Inc">Virtual Tech Gurus, Inc</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="customerName">Customer Name</label>
                                <input type="text" id="customerName" name="endCustomer" placeholder="Type/Select Customer Name">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="projectName">Project Name</label>
                            <input type="text" id="projectName" name="projectName">
                        </div>
                    </form>
                </div>

                <div class="section-card">
                    <div class="section-card-header">
                        <h2>Project Details</h2>
                    </div>
                    <!-- This form is part of the sowEditingForm above -->
                    <form>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectType">Project Type</label>
                                <select id="projectType" name="category">
                                    <option value="">Choose Project Type</option>
                                    <option value="RAAS">RAAS</option>
                                    <option value="Proposal">Proposal</option>
                                    <option value="Migration">Migration</option>
                                    <option value="Cloud Services">Cloud Services</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="serviceType">Service Type</label>
                                <select id="serviceType" name="serviceType">
                                    <option value="">Choose Service Type</option>
                                    <option value="Migration">Migration</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="sowType">SOW Type</label>
                                <select id="sowType" name="type">
                                    <option value="">Choose SOW Type</option>
                                    <option value="Fixed Price">Fixed Price</option>
                                    <option value="T&M">T&M</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="serviceLevel">Service Level</label>
                                <select id="serviceLevel" name="serviceLevel">
                                    <option value="">Choose Service Level</option>
                                    <option value="L1">L1</option>
                                    <option value="L2">L2</option>
                                    <option value="L3">L3</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Requirement File</label>
                            <div class="file-upload-box" onclick="document.getElementById('requirementFile').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Drag and Drop or Upload the Requirement File</p>
                                <input type="file" id="requirementFile" accept=".pdf,.doc,.docx">
                            </div>
                            <p class="text-sm text-gray-500 mt-2">Select File Craft a Requirement file?</p>
                        </div>
                    </form>
                </div>
            `,
            'cost-calculation': async () => { // Made async to handle potential future API calls
                let content = `
                    <div class="header">
                        <h1>Cost Calculation</h1>
                        <div class="flex space-x-3">
                            <button class="button-secondary" onclick="loadPage('sow-editing')">&larr; Back</button>
                            <button class="button-secondary" type="submit" form="costCalculationForm">Save</button>
                            <button class="button-primary" onclick="loadPage('payment-schedule')">Next Step &rarr;</button>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h2>Calculator Type</h2>
                        </div>
                        <form id="costCalculationForm"> <!-- Form for main calculation inputs -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="calculatorType">Calculator Type</label>
                                    <select id="calculatorType" name="calculatorType">
                                        <option>Migration Calculator</option>
                                        <option>RAAS Calculator</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="projectTypeCalc">Project Type</label>
                                    <select id="projectTypeCalc" name="projectTypeCalc">
                                        <option>Contract</option>
                                        <option>On Demand</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="risk">Risk %</label>
                                    <input type="number" id="risk" name="risk" value="0" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label for="discount">Discount %</label>
                                    <input type="number" id="discount" name="discount" value="0" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label for="cancellationFee">Cancellation Fee %</label>
                                    <input type="number" id="cancellationFee" name="cancellationFee" value="0" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label for="currency">Currency</label>
                                    <select id="currency" name="currency">
                                        <option>USD</option>
                                        <option>INR</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group flex items-center">
                                <input type="checkbox" id="contractTermOnDemand" name="contractTermOnDemand">
                                <label for="contractTermOnDemand" class="mb-0">Contract term On Demand</label>
                            </div>
                        </form>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h2>Service Items</h2>
                            <button class="button-primary" type="button" id="addServiceItemBtn">+ Add New</button>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Service Type</th>
                                        <th>Description</th>
                                        <th>Delivery Mode</th>
                                        <th># of Units</th>
                                        <th>Cost to Customer</th>
                                        <th>Migration Between DC</th>
                                        <th>Migration Provisioning</th>
                                        <th>Unit Definition</th>
                                        <th>Min. # req Per window</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="serviceItemsTableBody">
                                    <!-- Sample rows with input fields -->
                                    <tr data-item-id="1">
                                        <td><input type="text" value="Onboarding -X Small" class="w-full p-1 border rounded-md" name="serviceType_1"></td>
                                        <td><input type="text" value="Onboarding and Setup cost for X small size (1 array, less than 10 servers)" class="w-full p-1 border rounded-md" name="description_1"></td>
                                        <td><input type="text" value="Hybrid" class="w-full p-1 border rounded-md" name="deliveryMode_1"></td>
                                        <td><input type="number" value="1" min="0" class="w-full p-1 border rounded-md units-input" name="units_1"></td>
                                        <td><input type="number" value="1000" min="0" step="0.01" class="w-full p-1 border rounded-md cost-input" name="costToCustomer_1"></td>
                                        <td><input type="text" value="NA" class="w-full p-1 border rounded-md" name="migrationDC_1"></td>
                                        <td><input type="text" value="NA" class="w-full p-1 border rounded-md" name="migrationProv_1"></td>
                                        <td><input type="text" value="Per Customer" class="w-full p-1 border rounded-md" name="unitDef_1"></td>
                                        <td><input type="number" value="0" min="0" class="w-full p-1 border rounded-md" name="minReq_1"></td>
                                        <td><button type="button" class="text-red-500 hover:underline text-sm delete-item-btn">Delete</button></td>
                                    </tr>
                                    <tr data-item-id="2">
                                        <td><input type="text" value="Silver Migration -P2, V2V(x86)-Large" class="w-full p-1 border rounded-md" name="serviceType_2"></td>
                                        <td><input type="text" value="Migration Planning and Discovery (upto 500 Servers), Sample execution on non-prod servers (upto 5 Servers)" class="w-full p-1 border rounded-md" name="description_2"></td>
                                        <td><input type="text" value="Hybrid" class="w-full p-1 border rounded-md" name="deliveryMode_2"></td>
                                        <td><input type="number" value="1" min="0" class="w-full p-1 border rounded-md units-input" name="units_2"></td>
                                        <td><input type="number" value="27000" min="0" step="0.01" class="w-full p-1 border rounded-md cost-input" name="costToCustomer_2"></td>
                                        <td><input type="text" value="NA" class="w-full p-1 border rounded-md" name="migrationDC_2"></td>
                                        <td><input type="text" value="Included" class="w-full p-1 border rounded-md" name="migrationProv_2"></td>
                                        <td><input type="text" value="Per Unit" class="w-full p-1 border rounded-md" name="unitDef_2"></td>
                                        <td><input type="number" value="5" min="0" class="w-full p-1 border rounded-md" name="minReq_2"></td>
                                        <td><button type="button" class="text-red-500 hover:underline text-sm delete-item-btn">Delete</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex justify-end mt-4">
                            <p class="text-lg font-bold text-gray-700">Total Cost to Customer: <span class="text-blue-600" id="totalCostToCustomerSpan">$0.00</span></p>
                        </div>
                    </div>
                `;
                mainContent.innerHTML = content;

                // Attach event listeners for cost calculation inputs
                const costInputs = document.querySelectorAll('#costCalculationForm input[type="number"]');
                costInputs.forEach(input => {
                    input.addEventListener('input', calculateTotalCost);
                });

                // Attach event listeners for service item inputs
                const serviceItemInputs = document.querySelectorAll('.units-input, .cost-input');
                serviceItemInputs.forEach(input => {
                    input.addEventListener('input', calculateTotalCost);
                });

                // Attach delete button listeners for initial rows
                document.querySelectorAll('.delete-item-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.target.closest('tr').remove();
                        calculateTotalCost(); // Recalculate after deletion
                    });
                });

                // Attach Add New button listener
                document.getElementById('addServiceItemBtn').addEventListener('click', addServiceItemRow);

                // Initial calculation on page load
                calculateTotalCost();

                // Attach form submission listener for cost calculation form
                const costCalculationForm = document.getElementById('costCalculationForm');
                if (costCalculationForm) {
                    costCalculationForm.addEventListener('submit', handleCostCalculationSubmit);
                }
            },
            'payment-schedule': `
                <div class="header">
                    <h1>Payment Schedule</h1>
                    <div class="flex space-x-3">
                        <button class="button-secondary" onclick="loadPage('cost-calculation')">&larr; Back</button>
                        <button class="button-secondary" type="submit" form="paymentScheduleForm">Save</button>
                        <button class="button-primary" onclick="loadPage('sow-agreement')">Next Step &rarr;</button>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-card-header">
                        <h2>Payment Details</h2>
                    </div>
                    <form id="paymentScheduleForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="paymentType">Payment Type</label>
                                <select id="paymentType" name="paymentType">
                                    <option>Milestone</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="totalAmount">Total Amount</label>
                                <input type="text" id="totalAmount" name="totalAmount" value="$100000" readonly>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="section-card">
                    <div class="section-card-header">
                        <h2>Milestones</h2>
                        <button class="button-primary" type="button" id="addMilestoneBtn">+ Add New</button>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Milestone</th>
                                    <th>Percentage</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="milestonesTableBody">
                                <!-- Sample rows with input fields -->
                                <tr data-milestone-id="1">
                                    <td><input type="text" value="Milestone 1" class="w-full p-1 border rounded-md" name="milestoneName_1"></td>
                                    <td><input type="number" value="40" min="0" max="100" class="w-full p-1 border rounded-md milestone-percentage-input" name="milestonePercentage_1"></td>
                                    <td><input type="number" value="10000" min="0" step="0.01" class="w-full p-1 border rounded-md milestone-amount-input" name="milestoneAmount_1"></td>
                                    <td><button type="button" class="text-red-500 hover:underline text-sm delete-milestone-btn">Delete</button></td>
                                </tr>
                                <tr data-milestone-id="2">
                                    <td><input type="text" value="Milestone 2" class="w-full p-1 border rounded-md" name="milestoneName_2"></td>
                                    <td><input type="number" value="60" min="0" max="100" class="w-full p-1 border rounded-md milestone-percentage-input" name="milestonePercentage_2"></td>
                                    <td><input type="number" value="10000" min="0" step="0.01" class="w-full p-1 border rounded-md milestone-amount-input" name="milestoneAmount_2"></td>
                                    <td><button type="button" class="text-red-500 hover:underline text-sm delete-milestone-btn">Delete</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            'sow-agreement': `
                <div class="header">
                    <h1>SOW Agreement</h1>
                    <div class="flex space-x-3">
                        <button class="button-secondary">Export As PDF</button>
                        <button class="button-secondary" onclick="loadPage('dashboard')">X Close</button>
                    </div>
                </div>

                <div class="section-card sow-agreement-content">
                    <div class="section-card-header">
                        <h2>Summary</h2>
                    </div>
                    <p>This Statement of Work (SOW) is made and entered into between Virtual Tech Gurus, Inc. (VTG) with offices at 5050 Quorum Drive, Suite 300, Dallas, TX 75254 and World Wide Technology LLC (WWT) with offices at 1 World Wide Way, Maryland Heights, MO 63043 as of the date last written below ("Effective Date").</p>
                    <p>This SOW is governed by, incorporated into, and made part of the Master Agent Agreement between the parties dated June 13, 2023, and as amended as of the date of this SOW. Except as otherwise provided herein, VTG's Standard Terms & Conditions will apply. This SOW defines the services and deliverables that VTG shall provide to Client under the terms of the Agreement ("Services"). The terms of this SOW are limited to the scope of this SOW and shall not be applicable to any other Statements of Work, which may be executed under and attached to the Agreement.</p>

                    <h3>Executive Summary</h3>
                    <p>VTG (WWT) proposes to provide XYZ support on a Type of Service to assist with Queen's Health System Customer initiatives related to Engineer. This service includes the following components to exceed the standard:</p>
                    <ul>
                        <li>Getting RedConfiguration to Has Webber for the file transfer.</li>
                        <li>Storing configuration files (e.g., config file for database access and config file for web server) for both production and test and should be secured.</li>
                    </ul>

                    <h3>Scope of Service</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                    <h3>Deliverables</h3>
                    <ul>
                        <li>CCD Pending</li>
                        <li>System Integration</li>
                    </ul>

                    <h3>VTG Roles and Responsibility</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                    <h3>Partner Roles and Responsibility</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                    <h3>Assumptions</h3>
                    <p>This SOW and the pricing herein are prepared based on the following primary assumptions. Any deviations from these Assumptions may arise during the project and will be managed through the Change Management procedure. Parties agree that any changes to Assumptions shall mean an adjustment in pricing.</p>
                    <ul>
                        <li>The description of services is based on the Scope of Service.</li>
                        <li>Consultant support is not inclusive of any travel and expenses. It is anticipated that all remote support will not be performed outside of normal business hours and will be billed at After Hours Rate. The above estimates do not include any expenses.</li>
                        <li>VTG Resources will remain.</li>
                        <li>All user accounts required for this assignment will be created with the required permissions and access.</li>
                        <li>Client is responsible for any loss of, or damage to, recoverable data in connection with the Services provided.</li>
                        <li>Customer assumes responsibility for network connectivity, performance and configuration.</li>
                        <li>Customer assumes data issues and any.</li>
                    </ul>

                    <h3>Change Management Process</h3>
                    <p>In the event either party wishes to change this SOW, the following process will apply:</p>
                    <ol>
                        <li>To submit a change, a memorandum or document will be provided upon request to the other party. The memorandum will describe the effect the change will have on the scope of work, which may include a description of the nature of the change, the reason for the change, and the impact on the project timeline and cost.</li>
                        <li>The designated VTG Technical Consultant of the requesting party will review the proposed change with his/her counterpart. The parties will then review the change request and negotiate in good faith the changes to the Services and the additional charges, if any, for the change request.</li>
                        <li>If both parties agree to implement the change request, the appropriate authorized representatives of the parties sign the change request, indicating the acceptance of the change by the parties.</li>
                        <li>Upon execution of the change request, said change request will be incorporated into, and made part of, this SOW.</li>
                        <li>VTG shall have no obligation to perform the services outlined in the change request until the change request is signed by both parties.</li>
                    </ol>

                    <h3>Service Fees</h3>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>VTG Service</th>
                                    <th>Units</th>
                                    <th>Estimated Hour</th>
                                    <th>Rate USD</th>
                                    <th>Amount USD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Redcap Support</td>
                                    <td></td>
                                    <td>Redcap Support</td>
                                    <td>$100/hr</td>
                                    <td>$10000.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="mt-4">The estimated fees for Contracted are $10,000.00. The actual fees will vary based on actual hours and expenses.</p>

                    <h3>Payment Terms</h3>
                    <p>Customer shall be responsible for payment of all fees to Vendor for services performed under this Agreement. Vendor shall pay all applicable tax payments owed by Vendor because of any services performed under this Agreement.</p>

                    <h3>Payment Schedule</h3>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Milestone</th>
                                    <th>Estimate Date</th>
                                    <th>Percentage</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody id="milestonesTableBody">
                                <tr>
                                    <td>Milestone 1</td>
                                    <td>12 Jun 2025</td>
                                    <td>50%</td>
                                    <td>$10000</td>
                                </tr>
                                <tr>
                                    <td>Milestone 2</td>
                                    <td>12 Jun 2025</td>
                                    <td>50%</td>
                                    <td>$10000</td>
                                </tr>
                                <tr>
                                    <td>Total</td>
                                    <td></td>
                                    <td></td>
                                    <td>$20000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="mt-4">VTG will submit hours and expenses to Customer weekly for approval. VTG will invoice Customer monthly for approved invoices for the previous month's services as verified in the MSA.</p>

                    <h3>Expenses</h3>
                    <p>Travel expenses incurred by VTG personnel performing the contracted Services are NOT included in the stated fees. If travel is required by VTG personnel, the Customer is responsible for reimbursement of travel expenses on a regular basis and Client shall pay the invoices pursuant to the terms of the Agreement. Expenses will be approved by Client and such fees shall not exceed the standard travel and expense reimbursement rates established by both Parties.</p>

                    <div class="signature-section">
                        <div class="signature-block">
                            <p class="font-semibold">Customer Signatory</p>
                            <p>Project 1</p>
                            <p>000-000-0000</p>
                            <p>abc@company.com</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Assignment Signature</p>
                        </div>
                        <div class="signature-block">
                            <p class="font-semibold">VTG Signing Authority</p>
                            <p>Project 1</p>
                            <p>000-000-0000</p>
                            <p>abc@company.com</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Assignment Signature</p>
                        </div>
                    </div>

                    <p class="mt-8 text-sm text-gray-600">This SOW will be effective and become an integral part of the Agreement upon the signature of an authorized representative of both parties. This SOW supersedes all prior oral or written agreements and understanding to the subject matter of this SOW (provided that the Agreement remains in full force and effect). This SOW performs the same function in the same priority order.</p>
                    <p class="mt-2 text-sm text-gray-600">This SOW must be signed within one (1) days from this date Effective DATE or the project start date is more than 100 calendar days from the Effective Date. VTG reserves the right to cancel this SOW if not signed within the specified timeframe.</p>
                    <p class="mt-2 text-sm text-gray-600 font-bold">IN WITNESS WHEREOF, the parties, being duly authorized, have executed this Scope of Work.</p>

                    <div class="signature-section mt-8">
                        <div class="signature-block">
                            <p class="font-semibold">World Wide Technology LLC (WWT)</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Name</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Date</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Time</p>
                        </div>
                        <div class="signature-block">
                            <p class="font-semibold">Virtual Tech Gurus, Inc</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Name:</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Date</p>
                            <div class="signature-line"></div>
                            <p class="signature-label">Time:</p>
                        </div>
                    </div>
                </div>
            `,
            'opportunities-details': async () => {
                let content = `
                    <div class="header">
                        <h1>Opportunities Details</h1>
                        <button class="button-primary" onclick="loadPage('add-opportunity')">+ Add New Opportunity</button>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h2>All Opportunities</h2>
                            <div class="flex space-x-2">
                                <button class="button-secondary">Filter</button>
                                <button class="button-secondary">Sort by</button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ID.No</th>
                                        <th>Sales Rep</th>
                                        <th>Partner</th>
                                        <th>End Customer</th>
                                        <th>Category</th>
                                        <th>Subject</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="allOpportunitiesTableBody">
                                    <tr><td colspan="9" class="text-center py-4 text-gray-500">Loading opportunities...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                mainContent.innerHTML = content;
                const opportunities = await apiService.getOpportunities();
                renderOpportunitiesTable(opportunities, 'allOpportunitiesTableBody');
            },
            'add-opportunity': `
                <div class="header">
                    <h1>Add New Opportunity</h1>
                    <div class="flex space-x-3">
                        <button class="button-secondary" onclick="loadPage('dashboard')">Cancel</button>
                        <button class="button-primary" form="addOpportunityForm">Save Opportunity</button>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-card-header">
                        <h2>Opportunity Details</h2>
                    </div>
                    <form id="addOpportunityForm">
                        <div class="form-group">
                            <label for="newProjectName">Project Name</label>
                            <input type="text" id="newProjectName" name="projectName" required>
                        </div>
                        <div class="form-group">
                            <label for="newPartner">Partner</label>
                            <input type="text" id="newPartner" name="partner" required>
                        </div>
                        <div class="form-group">
                            <label for="newSalesRep">Sales Rep</label>
                            <input type="text" id="newSalesRep" name="salesRep">
                        </div>
                        <div class="form-group">
                            <label for="newEndCustomer">End Customer</label>
                            <input type="text" id="newEndCustomer" name="endCustomer">
                        </div>
                        <div class="form-group">
                            <label for="newCategory">Category</label>
                            <input type="text" id="newCategory" name="category">
                        </div>
                        <div class="form-group">
                            <label for="newSubject">Subject</label>
                            <input type="text" id="newSubject" name="subject">
                        </div>
                        <div class="form-group">
                            <label for="newType">Type</label>
                            <select id="newType" name="type">
                                <option value="">Select Type</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Fixed Price">Fixed Price</option>
                                <option value="T&M">T&M</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="newStatus">Status</label>
                            <select id="newStatus" name="status" required>
                                <option value="">Select Status</option>
                                <option value="Awarded">Awarded</option>
                                <option value="Rejected">Rejected</option>
                                <option value="On Negotiation">On Negotiation</option>
                                <option value="50%">50%</option>
                                <option value="75%">75%</option>
                                <option value="25%">25%</option>
                                <option value="90%">90%</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="newProgress">Progress</label>
                            <input type="text" id="newProgress" name="progress" placeholder="e.g., 50%">
                        </div>
                    </form>
                </div>
            `,
            'partners': ``,
            'templates': ``
        };

        // Function to load page content
        async function loadPage(pageName) {
            // Clear main content and show loading if it's a data-driven page
            if (pageName === 'dashboard' || pageName === 'opportunities-details') {
                mainContent.innerHTML = `<div class="text-center py-10 text-gray-500">Loading ${pageName.replace('-', ' ')}...</div>`;
            }

            // Call the page function if it's an async function (for data fetching)
            if (typeof pages[pageName] === 'function') {
                await pages[pageName]();
            } else {
                mainContent.innerHTML = pages[pageName];
            }

            sidebarLinks.forEach(link => {
                if (link.dataset.page === pageName) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            // Update URL hash without reloading
            window.location.hash = pageName;

            // Attach form submission listener if on 'add-opportunity' page
            if (pageName === 'add-opportunity') {
                const addOpportunityForm = document.getElementById('addOpportunityForm');
                if (addOpportunityForm) {
                    addOpportunityForm.addEventListener('submit', handleAddOpportunitySubmit);
                }
            } else if (pageName === 'sow-editing') { // New logic for SOW Editing form submission
                const sowEditingForm = document.getElementById('sowEditingForm');
                if (sowEditingForm) {
                    sowEditingForm.addEventListener('submit', handleSowEditingSubmit);
                }
            } else if (pageName === 'cost-calculation') { // New logic for Cost Calculation form submission
                const costCalculationForm = document.getElementById('costCalculationForm');
                if (costCalculationForm) {
                    costCalculationForm.addEventListener('submit', handleCostCalculationSubmit);
                }
            } else if (pageName === 'payment-schedule') { // New logic for Payment Schedule form submission
                const paymentScheduleForm = document.getElementById('paymentScheduleForm');
                if (paymentScheduleForm) {
                    paymentScheduleForm.addEventListener('submit', handlePaymentScheduleSubmit);
                }
            }
        }

        // Handle form submission for adding new opportunity
        async function handleAddOpportunitySubmit(event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const opportunityData = {};
            formData.forEach((value, key) => {
                opportunityData[key] = value;
            });

            // Basic validation
            if (!opportunityData.projectName || !opportunityData.partner || !opportunityData.status) {
                showMessage('Project Name, Partner, and Status are required fields.', true);
                return;
            }

            try {
                const newOpportunity = await apiService.createOpportunity(opportunityData);
                showMessage(`Opportunity "${newOpportunity.projectName}" added successfully!`);
                loadPage('dashboard'); // Navigate back to dashboard after successful add
            } catch (error) {
                // Error message already handled by apiService.createOpportunity
            }
        }

        // New function to handle SOW Editing form submission
        async function handleSowEditingSubmit(event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const opportunityData = {};

            // Map form fields to Opportunity model properties
            opportunityData.projectName = formData.get('projectName') || 'Unnamed Project';
            opportunityData.partner = formData.get('partner') || 'Unknown Partner';
            opportunityData.endCustomer = formData.get('endCustomer') || 'Unknown Customer';
            opportunityData.category = formData.get('category') || 'General'; // Mapped from projectType
            opportunityData.type = formData.get('type') || 'Unknown Type'; // Mapped from sowType

            // Provide default/dummy values for fields not present in the SOW Editing form
            opportunityData.salesRep = 'System User';
            opportunityData.subject = `${opportunityData.projectName} - ${opportunityData.category}`;
            opportunityData.status = 'On Negotiation'; // Default status for new SOWs
            opportunityData.progress = '0%'; // Default progress for new SOWs
            // createdDate will be set by the backend's @PrePersist

            // Basic validation for critical fields
            if (!opportunityData.projectName || !opportunityData.partner) {
                showMessage('Project Name and Partner are required fields for SOW.', true);
                return;
            }

            try {
                const newOpportunity = await apiService.createOpportunity(opportunityData);
                showMessage(`SOW "${newOpportunity.projectName}" saved successfully as a new opportunity!`);
                // No direct navigation here, as "Next Step" button handles it
            } catch (error) {
                // Error message already handled by apiService.createOpportunity
            }
        }

        // New function to handle Cost Calculation form submission
        async function handleCostCalculationSubmit(event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const costData = {};
            formData.forEach((value, key) => {
                costData[key] = value;
            });

            // Gather service item data
            const serviceItems = [];
            document.querySelectorAll('#serviceItemsTableBody tr').forEach(row => {
                const item = {};
                // Iterate over inputs in the row and collect data by name attribute
                row.querySelectorAll('input, select').forEach(input => {
                    // Extract the base name (e.g., 'serviceType' from 'serviceType_1')
                    const nameParts = input.name.split('_');
                    const baseName = nameParts[0];
                    item[baseName] = input.value;
                });
                serviceItems.push(item);
            });

            costData.serviceItems = serviceItems;
            costData.totalCostToCustomer = document.getElementById('totalCostToCustomerSpan').textContent;

            console.log('Cost Calculation Data to Save:', costData);
            showMessage('Cost Calculation data saved (console log only). In a full application, this would be sent to the backend.');
            // In a real application, you would send `costData` to your backend here
            // await apiService.saveCostCalculation(costData); // Example API call
        }

        // New function to handle Payment Schedule form submission
        async function handlePaymentScheduleSubmit(event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const paymentData = {};
            formData.forEach((value, key) => {
                paymentData[key] = value;
            });

            // Gather milestone data
            const milestones = [];
            document.querySelectorAll('#milestonesTableBody tr').forEach(row => {
                const milestone = {};
                row.querySelectorAll('input').forEach(input => {
                     // Extract the base name (e.g., 'milestoneName' from 'milestoneName_1')
                    const nameParts = input.name.split('_');
                    const baseName = nameParts[0];
                    milestone[baseName] = input.value;
                });
                milestones.push(milestone);
            });

            paymentData.milestones = milestones;
            paymentData.totalAmount = document.getElementById('totalAmount').value;

            console.log('Payment Schedule Data to Save:', paymentData);
            showMessage('Payment Schedule data saved (console log only). In a full application, this would be sent to the backend.');
            // In a real application, you would send `paymentData` to your backend here
            // await apiService.savePaymentSchedule(paymentData); // Example API call
        }


        // Event listeners for sidebar navigation
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = e.currentTarget.dataset.page;
                loadPage(pageName);
            });
        });

        // Handle direct navigation to opportunities-details from dashboard
        mainContent.addEventListener('click', (e) => {
            if (e.target.matches('a[data-page="opportunities-details"]')) {
                e.preventDefault();
                loadPage('opportunities-details');
            }
        });

        // Load page based on URL hash or default to dashboard
        window.addEventListener('load', () => {
            const initialPage = window.location.hash.substring(1) || 'dashboard';
            if (pages[initialPage]) {
                loadPage(initialPage);
            } else {
                loadPage('dashboard');
            }
        });
