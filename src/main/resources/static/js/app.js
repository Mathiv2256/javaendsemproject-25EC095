/* =========================================================
   MAINTAINIT
   Frontend Application Logic
========================================================= */

const API = {
    machines: "/api/machines",
    technicians: "/api/technicians",
    usageLogs: "/api/usage-logs",
    maintenanceTasks: "/api/maintenance-tasks"
};


/* =========================================================
   APPLICATION STATE
========================================================= */

let machines = [];
let technicians = [];
let usageLogs = [];
let maintenanceTasks = [];

let confirmCallback = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();
    initializeModals();
    initializeForms();
    initializeSearchAndFilters();
    initializeButtons();

    setDefaultDates();

    loadApplicationData();

});


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadApplicationData() {

    try {

        await Promise.all([
            loadMachines(),
            loadTechnicians(),
            loadUsageLogs(),
            loadMaintenanceTasks()
        ]);

        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            "Connection Error",
            "Unable to load data from the backend.",
            "error"
        );

    }

}


/* =========================================================
   GENERIC API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {

        let message = "Something went wrong.";

        if (data) {

            if (data.message) {
                message = data.message;
            }

            else if (data.messages) {
                message = Object.values(data.messages).join(", ");
            }

        }

        throw new Error(message);
    }

    return data;
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const section = item.dataset.section;

            showSection(section);

        });

    });


    document.querySelectorAll("[data-section-target]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.sectionTarget;

                showSection(section);

            });

        });


    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {

        mobileMenu.addEventListener("click", () => {

            const sidebar =
                document.querySelector(".sidebar");

            sidebar.classList.toggle("mobile-open");

        });

    }

}


function showSection(sectionId) {

    document.querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(sectionId);

    if (target) {
        target.classList.add("active");
    }


    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (item.dataset.section === sectionId) {
                item.classList.add("active");
            }

        });


    const titles = {
        dashboard: "Dashboard",
        machines: "Machines",
        technicians: "Technicians",
        usage: "Usage Logs",
        maintenance: "Maintenance Tasks"
    };


    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionId] || "MaintainIt";
    }


    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

}


/* =========================================================
   MACHINES
========================================================= */

async function loadMachines() {

    machines =
        await apiRequest(API.machines);

    renderMachines();
    populateMachineDropdowns();

}


function renderMachines() {

    const tbody =
        document.getElementById("machineTableBody");

    if (!tbody) return;


    const search =
        (document.getElementById("machineSearch")?.value || "")
            .toLowerCase()
            .trim();


    const statusFilter =
        document.getElementById("machineStatusFilter")?.value
        || "ALL";


    let filtered = machines.filter(machine => {

        const text = `
            ${machine.machineName || ""}
            ${machine.machineCode || ""}
            ${machine.model || ""}
            ${machine.manufacturer || ""}
        `.toLowerCase();


        return text.includes(search);

    });


    if (statusFilter !== "ALL") {

        filtered = filtered.filter(machine => {

            return getMachineStatus(machine) === statusFilter;

        });

    }


    const count =
        document.getElementById("machineRecordCount");

    if (count) {

        count.textContent =
            `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

    }


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">▣</div>
                        <h3>No machines found</h3>
                        <p>
                            Add a machine or change your search/filter.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = filtered.map(machine => {

        const status =
            getMachineStatus(machine);

        const usage =
            Number(machine.currentUsageHours || 0);

        const interval =
            Number(machine.maintenanceIntervalHours || 0);

        const percentage =
            interval > 0
                ? Math.min((usage / interval) * 100, 100)
                : 0;


        return `
            <tr>

                <td>
                    <span class="table-primary">
                        ${escapeHtml(machine.machineName)}
                    </span>

                    <span class="table-secondary">
                        ${escapeHtml(machine.model || "—")}
                    </span>
                </td>

                <td>
                    ${escapeHtml(machine.machineCode || "—")}
                </td>

                <td>
                    ${escapeHtml(machine.manufacturer || "—")}
                </td>

                <td>

                    <span class="table-primary">
                        ${formatNumber(usage)} hrs
                    </span>

                    <span class="table-secondary">
                        ${formatNumber(percentage)}% utilized
                    </span>

                </td>

                <td>
                    ${formatNumber(interval)} hrs
                </td>

                <td>
                    ${getStatusBadge(status)}
                </td>

                <td>

                    <div class="action-group">

                        <button
                            class="table-action"
                            onclick="editMachine(${machine.id})">
                            Edit
                        </button>

                        <button
                            class="table-action delete"
                            onclick="deleteMachine(${machine.id})">
                            Delete
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


/* =========================================================
   MACHINE STATUS
========================================================= */

function getMachineStatus(machine) {

    const usage =
        Number(machine.currentUsageHours || 0);

    const interval =
        Number(machine.maintenanceIntervalHours || 0);


    if (interval <= 0) {
        return "NOT_CONFIGURED";
    }

    if (usage >= interval) {
        return "DUE";
    }

    if (usage >= interval * 0.90) {
        return "APPROACHING";
    }

    return "NORMAL";
}


function getStatusBadge(status) {

    const statusMap = {

        NORMAL: {
            label: "Normal",
            className: "status-normal"
        },

        APPROACHING: {
            label: "Approaching",
            className: "status-approaching"
        },

        DUE: {
            label: "Due",
            className: "status-due"
        },

        OPEN: {
            label: "Open",
            className: "status-open"
        },

        COMPLETED: {
            label: "Completed",
            className: "status-completed"
        },

        NOT_CONFIGURED: {
            label: "Not Configured",
            className: "status-open"
        }

    };


    const item =
        statusMap[status] || {
            label: status,
            className: "status-open"
        };


    return `
        <span class="status-badge ${item.className}">
            ${item.label}
        </span>
    `;
}


/* =========================================================
   MACHINE FORM
========================================================= */

function initializeMachineForm() {

    const form =
        document.getElementById("machineForm");

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();

        const id =
            document.getElementById("machineId").value;


        const machineData = {

            machineName:
                document.getElementById("machineName").value.trim(),

            machineCode:
                document.getElementById("machineCode").value.trim(),

            model:
                document.getElementById("machineModel").value.trim(),

            manufacturer:
                document.getElementById("machineManufacturer").value.trim(),

            currentUsageHours:
                Number(document.getElementById("currentUsage").value),

            maintenanceIntervalHours:
                Number(document.getElementById("maintenanceInterval").value)

        };


        try {

            if (id) {

                await apiRequest(
                    `${API.machines}/${id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(machineData)
                    }
                );

                showToast(
                    "Machine Updated",
                    "Machine information was updated successfully.",
                    "success"
                );

            } else {

                await apiRequest(
                    API.machines,
                    {
                        method: "POST",
                        body: JSON.stringify(machineData)
                    }
                );

                showToast(
                    "Machine Added",
                    "Machine was registered successfully.",
                    "success"
                );

            }


            closeModal("machineModal");

            form.reset();

            document.getElementById("machineId").value = "";

            document.getElementById("machineModalTitle")
                .textContent = "Add Machine";


            await loadMachines();
            await loadUsageLogs();
            await loadMaintenanceTasks();

            updateDashboard();

        } catch (error) {

            showToast(
                "Unable to Save Machine",
                error.message,
                "error"
            );

        }

    });

}


/* =========================================================
   EDIT MACHINE
========================================================= */

window.editMachine = function(id) {

    const machine =
        machines.find(item => item.id === id);

    if (!machine) return;


    document.getElementById("machineId").value =
        machine.id;

    document.getElementById("machineName").value =
        machine.machineName || "";

    document.getElementById("machineCode").value =
        machine.machineCode || "";

    document.getElementById("machineModel").value =
        machine.model || "";

    document.getElementById("machineManufacturer").value =
        machine.manufacturer || "";

    document.getElementById("currentUsage").value =
        machine.currentUsageHours ?? 0;

    document.getElementById("maintenanceInterval").value =
        machine.maintenanceIntervalHours ?? 0;

    document.getElementById("machineModalTitle")
        .textContent = "Edit Machine";


    openModal("machineModal");

};


/* =========================================================
   DELETE MACHINE
========================================================= */

window.deleteMachine = function(id) {

    const machine =
        machines.find(item => item.id === id);

    if (!machine) return;


    askConfirmation(
        "Delete Machine",
        `Delete "${machine.machineName}"? This action cannot be undone.`,
        async () => {

            try {

                await apiRequest(
                    `${API.machines}/${id}`,
                    {
                        method: "DELETE"
                    }
                );

                showToast(
                    "Machine Deleted",
                    "Machine was removed successfully.",
                    "success"
                );


                await loadMachines();
                await loadUsageLogs();
                await loadMaintenanceTasks();

                updateDashboard();

            } catch (error) {

                showToast(
                    "Unable to Delete",
                    error.message,
                    "error"
                );

            }

        }
    );

};


/* =========================================================
   TECHNICIANS
========================================================= */

async function loadTechnicians() {

    technicians =
        await apiRequest(API.technicians);

    renderTechnicians();

    populateTechnicianDropdown();

}


function renderTechnicians() {

    const container =
        document.getElementById("technicianGrid");

    if (!container) return;


    const search =
        (document.getElementById("technicianSearch")?.value || "")
            .toLowerCase()
            .trim();


    const filtered =
        technicians.filter(technician => {

            const text = `
                ${technician.name || ""}
                ${technician.email || ""}
                ${technician.phone || ""}
                ${technician.specialization || ""}
            `.toLowerCase();


            return text.includes(search);

        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">◉</div>

                <h3>No technicians found</h3>

                <p>
                    Add a technician or change your search.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(technician => {

            const initials =
                getInitials(technician.name);


            return `
                <div class="technician-card">

                    <div class="technician-card-top">

                        <div class="technician-avatar">
                            ${initials}
                        </div>

                        <div class="action-group">

                            <button
                                class="table-action"
                                onclick="editTechnician(${technician.id})">
                                Edit
                            </button>

                            <button
                                class="table-action delete"
                                onclick="deleteTechnician(${technician.id})">
                                Delete
                            </button>

                        </div>

                    </div>


                    <h3>
                        ${escapeHtml(technician.name)}
                    </h3>

                    <div class="technician-specialization">
                        ${escapeHtml(
                technician.specialization || "Maintenance"
            )}
                    </div>


                    <div class="technician-contact">

                        <div class="contact-row">
                            <span>✉</span>
                            <span>
                                ${escapeHtml(technician.email || "—")}
                            </span>
                        </div>

                        <div class="contact-row">
                            <span>☎</span>
                            <span>
                                ${escapeHtml(technician.phone || "—")}
                            </span>
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   TECHNICIAN FORM
========================================================= */

function initializeTechnicianForm() {

    const form =
        document.getElementById("technicianForm");

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const id =
            document.getElementById("technicianId").value;


        const technicianData = {

            name:
                document.getElementById("technicianName").value.trim(),

            email:
                document.getElementById("technicianEmail").value.trim(),

            phone:
                document.getElementById("technicianPhone").value.trim(),

            specialization:
                document
                    .getElementById("technicianSpecialization")
                    .value
                    .trim()

        };


        try {

            if (id) {

                await apiRequest(
                    `${API.technicians}/${id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(technicianData)
                    }
                );

                showToast(
                    "Technician Updated",
                    "Technician information was updated successfully.",
                    "success"
                );

            } else {

                await apiRequest(
                    API.technicians,
                    {
                        method: "POST",
                        body: JSON.stringify(technicianData)
                    }
                );

                showToast(
                    "Technician Added",
                    "Technician was registered successfully.",
                    "success"
                );

            }


            closeModal("technicianModal");

            form.reset();

            document.getElementById("technicianId").value = "";

            document.getElementById("technicianModalTitle")
                .textContent = "Add Technician";


            await loadTechnicians();
            await loadMaintenanceTasks();

            updateDashboard();

        } catch (error) {

            showToast(
                "Unable to Save Technician",
                error.message,
                "error"
            );

        }

    });

}


/* =========================================================
   EDIT TECHNICIAN
========================================================= */

window.editTechnician = function(id) {

    const technician =
        technicians.find(item => item.id === id);

    if (!technician) return;


    document.getElementById("technicianId").value =
        technician.id;

    document.getElementById("technicianName").value =
        technician.name || "";

    document.getElementById("technicianEmail").value =
        technician.email || "";

    document.getElementById("technicianPhone").value =
        technician.phone || "";

    document.getElementById("technicianSpecialization").value =
        technician.specialization || "";


    document.getElementById("technicianModalTitle")
        .textContent = "Edit Technician";


    openModal("technicianModal");

};


/* =========================================================
   DELETE TECHNICIAN
========================================================= */

window.deleteTechnician = function(id) {

    const technician =
        technicians.find(item => item.id === id);

    if (!technician) return;


    askConfirmation(
        "Delete Technician",
        `Delete "${technician.name}"?`,
        async () => {

            try {

                await apiRequest(
                    `${API.technicians}/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                showToast(
                    "Technician Deleted",
                    "Technician was removed successfully.",
                    "success"
                );


                await loadTechnicians();
                await loadMaintenanceTasks();

                updateDashboard();

            } catch (error) {

                showToast(
                    "Unable to Delete",
                    error.message,
                    "error"
                );

            }

        }
    );

};


/* =========================================================
   USAGE LOGS
========================================================= */

async function loadUsageLogs() {

    usageLogs =
        await apiRequest(API.usageLogs);

    renderUsageLogs();

    updateUsageSummary();

}


function renderUsageLogs() {

    const tbody =
        document.getElementById("usageTableBody");

    if (!tbody) return;


    const search =
        (document.getElementById("usageSearch")?.value || "")
            .toLowerCase()
            .trim();


    const filtered =
        usageLogs.filter(log => {

            const machine =
                getMachineById(log.machine?.id);


            const text = `
                ${machine?.machineName || ""}
                ${machine?.machineCode || ""}
                ${log.description || ""}
                ${log.usageDate || ""}
            `.toLowerCase();


            return text.includes(search);

        });


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">

                    <div class="empty-state">

                        <div class="empty-icon">◷</div>

                        <h3>No usage logs found</h3>

                        <p>
                            Record machine usage to create history.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        return;
    }


    const sorted =
        [...filtered].sort(
            (a, b) =>
                new Date(b.usageDate) -
                new Date(a.usageDate)
        );


    tbody.innerHTML =
        sorted.map(log => {

            const machine =
                getMachineById(log.machine?.id);


            return `
                <tr>

                    <td>
                        ${formatDate(log.usageDate)}
                    </td>

                    <td>

                        <span class="table-primary">
                            ${escapeHtml(
                machine?.machineName || "Unknown"
            )}
                        </span>

                        <span class="table-secondary">
                            ${escapeHtml(
                machine?.machineCode || "—"
            )}
                        </span>

                    </td>

                    <td>

                        <span class="table-primary">
                            ${formatNumber(log.hoursUsed)} hrs
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                log.description || "—"
            )}
                    </td>

                    <td>

                        <button
                            class="table-action delete"
                            onclick="deleteUsageLog(${log.id})">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   USAGE FORM
========================================================= */

function initializeUsageForm() {

    const form =
        document.getElementById("usageForm");

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const usageData = {

            machineId:
                Number(
                    document.getElementById("usageMachine").value
                ),

            hoursUsed:
                Number(
                    document.getElementById("usageHours").value
                ),

            usageDate:
            document.getElementById("usageDate").value,

            description:
                document
                    .getElementById("usageDescription")
                    .value
                    .trim()

        };


        try {

            await apiRequest(
                API.usageLogs,
                {
                    method: "POST",
                    body: JSON.stringify(usageData)
                }
            );


            showToast(
                "Usage Recorded",
                "Machine usage has been updated successfully.",
                "success"
            );


            closeModal("usageModal");

            form.reset();

            setDefaultDates();


            await loadMachines();
            await loadUsageLogs();

            updateDashboard();

        } catch (error) {

            showToast(
                "Unable to Record Usage",
                error.message,
                "error"
            );

        }

    });

}


/* =========================================================
   DELETE USAGE LOG
========================================================= */

window.deleteUsageLog = function(id) {

    askConfirmation(
        "Delete Usage Log",
        "Delete this usage record?",
        async () => {

            try {

                await apiRequest(
                    `${API.usageLogs}/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                showToast(
                    "Usage Log Deleted",
                    "The usage record was deleted.",
                    "success"
                );


                await loadUsageLogs();
                await loadMachines();

                updateDashboard();

            } catch (error) {

                showToast(
                    "Unable to Delete",
                    error.message,
                    "error"
                );

            }

        }
    );

};


/* =========================================================
   MAINTENANCE TASKS
========================================================= */

async function loadMaintenanceTasks() {

    maintenanceTasks =
        await apiRequest(API.maintenanceTasks);

    renderMaintenanceTasks();

    updateMaintenanceSummary();

}


function renderMaintenanceTasks() {

    const tbody =
        document.getElementById("maintenanceTableBody");

    if (!tbody) return;


    const search =
        (
            document.getElementById("maintenanceSearch")
                ?.value || ""
        )
            .toLowerCase()
            .trim();


    const statusFilter =
        document.getElementById("maintenanceStatusFilter")
            ?.value || "ALL";


    let filtered =
        maintenanceTasks.filter(task => {

            const machine =
                getMachineById(task.machine?.id);

            const technician =
                getTechnicianById(task.technician?.id);


            const text = `
                ${machine?.machineName || ""}
                ${machine?.machineCode || ""}
                ${technician?.name || ""}
                ${task.taskDescription || ""}
                ${task.status || ""}
            `.toLowerCase();


            return text.includes(search);

        });


    if (statusFilter !== "ALL") {

        filtered =
            filtered.filter(
                task =>
                    task.status === statusFilter
            );

    }


    const recordCount =
        document.getElementById(
            "maintenanceRecordCount"
        );

    if (recordCount) {

        recordCount.textContent =
            `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

    }


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td colspan="7">

                    <div class="empty-state">

                        <div class="empty-icon">◆</div>

                        <h3>No maintenance tasks found</h3>

                        <p>
                            Schedule a maintenance task to see it here.
                        </p>

                    </div>

                </td>

            </tr>
        `;

        return;
    }


    const sorted =
        [...filtered].sort(
            (a, b) =>
                new Date(b.scheduledDate) -
                new Date(a.scheduledDate)
        );


    tbody.innerHTML =
        sorted.map(task => {

            const machine =
                getMachineById(task.machine?.id);

            const technician =
                getTechnicianById(task.technician?.id);


            return `
                <tr>

                    <td>

                        <span class="table-primary">
                            ${escapeHtml(
                machine?.machineName || "Unknown"
            )}
                        </span>

                        <span class="table-secondary">
                            ${escapeHtml(
                machine?.machineCode || "—"
            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                task.taskDescription || "—"
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                technician?.name || "Unknown"
            )}
                    </td>

                    <td>
                        ${formatDate(
                task.scheduledDate
            )}
                    </td>

                    <td>
                        ${getStatusBadge(task.status)}
                    </td>

                    <td>
                        ${
                task.completedDate
                    ? formatDate(task.completedDate)
                    : "—"
            }
                    </td>

                    <td>

                        <div class="action-group">

                            ${
                task.status === "OPEN"
                    ? `
                                        <button
                                            class="table-action complete"
                                            onclick="completeMaintenance(${task.id})">
                                            Complete
                                        </button>
                                      `
                    : ""
            }

                            <button
                                class="table-action delete"
                                onclick="deleteMaintenance(${task.id})">
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   MAINTENANCE FORM
========================================================= */

function initializeMaintenanceForm() {

    const form =
        document.getElementById("maintenanceForm");

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const taskData = {

            machineId:
                Number(
                    document.getElementById(
                        "maintenanceMachine"
                    ).value
                ),

            technicianId:
                Number(
                    document.getElementById(
                        "maintenanceTechnician"
                    ).value
                ),

            taskDescription:
                document
                    .getElementById("taskDescription")
                    .value
                    .trim(),

            scheduledDate:
            document.getElementById(
                "scheduledDate"
            ).value,

            completedDate: null,

            status: "OPEN",

            notes:
                document
                    .getElementById("taskNotes")
                    .value
                    .trim()

        };


        try {

            await apiRequest(
                API.maintenanceTasks,
                {
                    method: "POST",
                    body: JSON.stringify(taskData)
                }
            );


            showToast(
                "Maintenance Scheduled",
                "The maintenance task was created successfully.",
                "success"
            );


            closeModal("maintenanceModal");

            form.reset();

            setDefaultDates();


            await loadMaintenanceTasks();

            updateDashboard();

        } catch (error) {

            showToast(
                "Unable to Schedule",
                error.message,
                "error"
            );

        }

    });

}


/* =========================================================
   COMPLETE MAINTENANCE
========================================================= */

window.completeMaintenance = function(id) {

    const task =
        maintenanceTasks.find(
            item => item.id === id
        );

    if (!task) return;


    askConfirmation(
        "Complete Maintenance",
        "Complete this task? The machine usage counter will be reset to 0.",
        async () => {

            try {

                await apiRequest(
                    `${API.maintenanceTasks}/${id}/complete`,
                    {
                        method: "PUT"
                    }
                );


                showToast(
                    "Maintenance Completed",
                    "Task completed and machine counter reset.",
                    "success"
                );


                await loadMachines();
                await loadMaintenanceTasks();

                updateDashboard();

            } catch (error) {

                showToast(
                    "Unable to Complete Task",
                    error.message,
                    "error"
                );

            }

        }
    );

};


/* =========================================================
   DELETE MAINTENANCE
========================================================= */

window.deleteMaintenance = function(id) {

    askConfirmation(
        "Delete Maintenance Task",
        "Delete this maintenance task?",
        async () => {

            try {

                await apiRequest(
                    `${API.maintenanceTasks}/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                showToast(
                    "Task Deleted",
                    "Maintenance task was deleted.",
                    "success"
                );


                await loadMaintenanceTasks();

                updateDashboard();

            } catch (error) {

                showToast(
                    "Unable to Delete",
                    error.message,
                    "error"
                );

            }

        }
    );

};


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        machines.length;


    let normal = 0;
    let approaching = 0;
    let due = 0;


    machines.forEach(machine => {

        const status =
            getMachineStatus(machine);


        if (status === "NORMAL") {
            normal++;
        }

        else if (status === "APPROACHING") {
            approaching++;
        }

        else if (status === "DUE") {
            due++;
        }

    });


    const openTasks =
        maintenanceTasks.filter(
            task => task.status === "OPEN"
        ).length;


    setText("totalMachines", total);
    setText("normalMachines", normal);
    setText("approachingMachines", approaching);
    setText("dueMachines", due);
    setText("openTasks", openTasks);
    setText("totalTechnicians", technicians.length);


    renderDashboardMachines();
    renderDashboardTasks();

}


/* =========================================================
   DASHBOARD MACHINES
========================================================= */

function renderDashboardMachines() {

    const container =
        document.getElementById(
            "dashboardMachineList"
        );

    if (!container) return;


    if (machines.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">▣</div>

                <h3>No machine data</h3>

                <p>
                    Add machines to start monitoring maintenance status.
                </p>

            </div>
        `;

        return;
    }


    const sorted =
        [...machines].sort((a, b) => {

            const order = {
                DUE: 1,
                APPROACHING: 2,
                NORMAL: 3
            };

            return (
                (order[getMachineStatus(a)] || 4) -
                (order[getMachineStatus(b)] || 4)
            );

        });


    container.innerHTML =
        sorted.slice(0, 6).map(machine => {

            const usage =
                Number(machine.currentUsageHours || 0);

            const interval =
                Number(machine.maintenanceIntervalHours || 0);

            const percentage =
                interval > 0
                    ? Math.min((usage / interval) * 100, 100)
                    : 0;

            const status =
                getMachineStatus(machine);


            return `
                <div class="machine-overview-item">

                    <div class="machine-overview-top">

                        <div>

                            <div class="machine-name">
                                ${escapeHtml(
                machine.machineName
            )}
                            </div>

                            <div class="machine-code">
                                ${escapeHtml(
                machine.machineCode || "—"
            )}
                            </div>

                        </div>

                        ${getStatusBadge(status)}

                    </div>


                    <div class="machine-progress">

                        <div class="progress-track">

                            <div
                                class="progress-fill ${status.toLowerCase()}"
                                style="width:${percentage}%">
                            </div>

                        </div>


                        <div class="progress-info">

                            <span>
                                ${formatNumber(usage)} hrs used
                            </span>

                            <span>
                                ${formatNumber(interval)} hrs interval
                            </span>

                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   DASHBOARD TASKS
========================================================= */

function renderDashboardTasks() {

    const container =
        document.getElementById(
            "dashboardTaskList"
        );

    if (!container) return;


    const openTasks =
        maintenanceTasks
            .filter(task => task.status === "OPEN")
            .sort(
                (a, b) =>
                    new Date(a.scheduledDate) -
                    new Date(b.scheduledDate)
            );


    if (openTasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state compact">

                <div class="empty-icon">◆</div>

                <h3>No open tasks</h3>

                <p>
                    Scheduled maintenance tasks will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        openTasks.slice(0, 5).map(task => {

            const machine =
                getMachineById(task.machine?.id);

            const technician =
                getTechnicianById(task.technician?.id);


            return `
                <div class="task-item">

                    <div class="task-item-title">
                        ${escapeHtml(
                task.taskDescription
            )}
                    </div>


                    <div class="task-item-meta">

                        <span>
                            ${escapeHtml(
                machine?.machineName || "Unknown"
            )}
                        </span>

                        <span>
                            ${formatDate(
                task.scheduledDate
            )}
                        </span>

                    </div>


                    <div class="task-item-meta">

                        <span>
                            ${escapeHtml(
                technician?.name || "Unassigned"
            )}
                        </span>

                        ${getStatusBadge(task.status)}

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   USAGE SUMMARY
========================================================= */

function updateUsageSummary() {

    const total =
        usageLogs.length;


    const totalHours =
        usageLogs.reduce(
            (sum, log) =>
                sum + Number(log.hoursUsed || 0),
            0
        );


    const latest =
        [...usageLogs]
            .sort(
                (a, b) =>
                    new Date(b.usageDate) -
                    new Date(a.usageDate)
            )[0];


    setText(
        "totalUsageLogs",
        total
    );

    setText(
        "totalUsageHours",
        `${formatNumber(totalHours)} hrs`
    );

    setText(
        "latestUsageDate",
        latest
            ? formatDate(latest.usageDate)
            : "—"
    );

}


/* =========================================================
   MAINTENANCE SUMMARY
========================================================= */

function updateMaintenanceSummary() {

    const total =
        maintenanceTasks.length;


    const open =
        maintenanceTasks.filter(
            task => task.status === "OPEN"
        ).length;


    const completed =
        maintenanceTasks.filter(
            task => task.status === "COMPLETED"
        ).length;


    setText("totalTasks", total);
    setText("maintenanceOpenTasks", open);
    setText("completedTasks", completed);

}


/* =========================================================
   DROPDOWNS
========================================================= */

function populateMachineDropdowns() {

    const dropdowns = [

        document.getElementById("usageMachine"),

        document.getElementById("maintenanceMachine")

    ];


    dropdowns.forEach(select => {

        if (!select) return;


        const currentValue =
            select.value;


        select.innerHTML = `
            <option value="">
                Select machine
            </option>
        `;


        machines.forEach(machine => {

            const option =
                document.createElement("option");

            option.value =
                machine.id;

            option.textContent =
                `${machine.machineName} (${machine.machineCode})`;

            select.appendChild(option);

        });


        if (currentValue) {
            select.value = currentValue;
        }

    });

}


function populateTechnicianDropdown() {

    const select =
        document.getElementById(
            "maintenanceTechnician"
        );

    if (!select) return;


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Select technician
        </option>
    `;


    technicians.forEach(technician => {

        const option =
            document.createElement("option");

        option.value =
            technician.id;

        option.textContent =
            `${technician.name} — ${technician.specialization}`;

        select.appendChild(option);

    });


    if (currentValue) {
        select.value = currentValue;
    }

}


/* =========================================================
   MODALS
========================================================= */

function initializeModals() {

    document.querySelectorAll(
        "[data-close-modal]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            closeModal(
                button.dataset.closeModal
            );

        });

    });


    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(overlay => {

        overlay.addEventListener(
            "click",
            event => {

                if (event.target === overlay) {

                    closeModal(
                        overlay.id
                    );

                }

            }
        );

    });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                document
                    .querySelectorAll(".modal-overlay.active")
                    .forEach(modal => {

                        closeModal(modal.id);

                    });

            }

        }
    );

}


function openModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.remove("active");

    }


    if (
        document.querySelectorAll(
            ".modal-overlay.active"
        ).length === 0
    ) {

        document.body.style.overflow = "";

    }

}


/* =========================================================
   BUTTONS
========================================================= */

function initializeButtons() {

    const openMachine =
        document.getElementById(
            "openMachineModal"
        );

    if (openMachine) {

        openMachine.addEventListener(
            "click",
            () => {

                resetMachineForm();

                openModal("machineModal");

            }
        );

    }


    const openTechnician =
        document.getElementById(
            "openTechnicianModal"
        );

    if (openTechnician) {

        openTechnician.addEventListener(
            "click",
            () => {

                resetTechnicianForm();

                openModal("technicianModal");

            }
        );

    }


    const openUsage =
        document.getElementById(
            "openUsageModal"
        );

    if (openUsage) {

        openUsage.addEventListener(
            "click",
            () => {

                resetUsageForm();

                openModal("usageModal");

            }
        );

    }


    const openMaintenance =
        document.getElementById(
            "openMaintenanceModal"
        );

    if (openMaintenance) {

        openMaintenance.addEventListener(
            "click",
            () => {

                resetMaintenanceForm();

                openModal("maintenanceModal");

            }
        );

    }


    const refreshDashboard =
        document.getElementById(
            "refreshDashboard"
        );

    if (refreshDashboard) {

        refreshDashboard.addEventListener(
            "click",
            async () => {

                await loadApplicationData();

                showToast(
                    "Dashboard Refreshed",
                    "Latest data has been loaded.",
                    "success"
                );

            }
        );

    }


    const refreshMachines =
        document.getElementById(
            "refreshMachines"
        );

    if (refreshMachines) {

        refreshMachines.addEventListener(
            "click",
            async () => {

                await loadMachines();

                updateDashboard();

            }
        );

    }


    const refreshTechnicians =
        document.getElementById(
            "refreshTechnicians"
        );

    if (refreshTechnicians) {

        refreshTechnicians.addEventListener(
            "click",
            async () => {

                await loadTechnicians();

                updateDashboard();

            }
        );

    }


    const refreshMaintenance =
        document.getElementById(
            "refreshMaintenance"
        );

    if (refreshMaintenance) {

        refreshMaintenance.addEventListener(
            "click",
            async () => {

                await loadMaintenanceTasks();

                updateDashboard();

            }
        );

    }

}


/* =========================================================
   FORM INITIALIZATION
========================================================= */

function initializeForms() {

    initializeMachineForm();

    initializeTechnicianForm();

    initializeUsageForm();

    initializeMaintenanceForm();

}


/* =========================================================
   SEARCH AND FILTERS
========================================================= */

function initializeSearchAndFilters() {

    const machineSearch =
        document.getElementById(
            "machineSearch"
        );

    if (machineSearch) {

        machineSearch.addEventListener(
            "input",
            renderMachines
        );

    }


    const machineStatus =
        document.getElementById(
            "machineStatusFilter"
        );

    if (machineStatus) {

        machineStatus.addEventListener(
            "change",
            renderMachines
        );

    }


    const technicianSearch =
        document.getElementById(
            "technicianSearch"
        );

    if (technicianSearch) {

        technicianSearch.addEventListener(
            "input",
            renderTechnicians
        );

    }


    const usageSearch =
        document.getElementById(
            "usageSearch"
        );

    if (usageSearch) {

        usageSearch.addEventListener(
            "input",
            renderUsageLogs
        );

    }


    const maintenanceSearch =
        document.getElementById(
            "maintenanceSearch"
        );

    if (maintenanceSearch) {

        maintenanceSearch.addEventListener(
            "input",
            renderMaintenanceTasks
        );

    }


    const maintenanceStatus =
        document.getElementById(
            "maintenanceStatusFilter"
        );

    if (maintenanceStatus) {

        maintenanceStatus.addEventListener(
            "change",
            renderMaintenanceTasks
        );

    }

}


/* =========================================================
   RESET FORMS
========================================================= */

function resetMachineForm() {

    const form =
        document.getElementById("machineForm");

    if (form) {
        form.reset();
    }


    setValue("machineId", "");

    setValue("currentUsage", "0");

    setValue("maintenanceInterval", "");


    setText(
        "machineModalTitle",
        "Add Machine"
    );

}


function resetTechnicianForm() {

    const form =
        document.getElementById("technicianForm");

    if (form) {
        form.reset();
    }


    setValue("technicianId", "");


    setText(
        "technicianModalTitle",
        "Add Technician"
    );

}


function resetUsageForm() {

    const form =
        document.getElementById("usageForm");

    if (form) {
        form.reset();
    }


    setDefaultDates();

}


function resetMaintenanceForm() {

    const form =
        document.getElementById(
            "maintenanceForm"
        );

    if (form) {
        form.reset();
    }


    setDefaultDates();

}


/* =========================================================
   DEFAULT DATES
========================================================= */

function setDefaultDates() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const usageDate =
        document.getElementById(
            "usageDate"
        );

    if (usageDate) {
        usageDate.value = today;
    }


    const scheduledDate =
        document.getElementById(
            "scheduledDate"
        );

    if (scheduledDate) {
        scheduledDate.value = today;
    }

}


/* =========================================================
   CONFIRMATION
========================================================= */

function askConfirmation(
    title,
    message,
    callback
) {

    setText(
        "confirmTitle",
        title
    );

    setText(
        "confirmMessage",
        message
    );


    confirmCallback =
        callback;


    openModal("confirmModal");

}


const confirmButton =
    document.getElementById(
        "confirmAction"
    );

if (confirmButton) {

    confirmButton.addEventListener(
        "click",
        async () => {

            if (confirmCallback) {

                const callback =
                    confirmCallback;

                confirmCallback = null;

                closeModal("confirmModal");

                await callback();

            }

        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) return;


    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <div class="toast-title">
            ${escapeHtml(title)}
        </div>

        <div class="toast-message">
            ${escapeHtml(message)}
        </div>

    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(15px)";


        setTimeout(() => {

            toast.remove();

        }, 200);

    }, 3500);

}


/* =========================================================
   HELPERS
========================================================= */

function getMachineById(id) {

    return machines.find(
        machine =>
            Number(machine.id) === Number(id)
    );

}


function getTechnicianById(id) {

    return technicians.find(
        technician =>
            Number(technician.id) === Number(id)
    );

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value;
    }

}


function formatNumber(value) {

    const number =
        Number(value || 0);

    return number.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getInitials(name) {

    if (!name) {
        return "T";
    }


    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0).toUpperCase()
        )
        .join("");

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GLOBAL ERROR HANDLING
========================================================= */

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );

    }
);