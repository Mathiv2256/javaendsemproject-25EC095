package com.maintainit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class MaintenanceTaskDTO {

    @NotNull(message = "Machine ID is required")
    private Long machineId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    @NotBlank(message = "Task description is required")
    private String taskDescription;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    private LocalDate completedDate;

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;

    public MaintenanceTaskDTO() {
    }

    public MaintenanceTaskDTO(
            Long machineId,
            Long technicianId,
            String taskDescription,
            LocalDate scheduledDate,
            LocalDate completedDate,
            String status,
            String notes) {

        this.machineId = machineId;
        this.technicianId = technicianId;
        this.taskDescription = taskDescription;
        this.scheduledDate = scheduledDate;
        this.completedDate = completedDate;
        this.status = status;
        this.notes = notes;
    }

    public Long getMachineId() {
        return machineId;
    }

    public void setMachineId(Long machineId) {
        this.machineId = machineId;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}