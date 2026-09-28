package com.maintainit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class UsageLogDTO {

    @NotNull(message = "Machine ID is required")
    private Long machineId;

    @NotNull(message = "Hours used is required")
    @Positive(message = "Hours used must be greater than 0")
    private Double hoursUsed;

    @NotNull(message = "Usage date is required")
    private LocalDate usageDate;

    private String description;

    public UsageLogDTO() {
    }

    public UsageLogDTO(Long machineId, Double hoursUsed,
                       LocalDate usageDate, String description) {
        this.machineId = machineId;
        this.hoursUsed = hoursUsed;
        this.usageDate = usageDate;
        this.description = description;
    }

    public Long getMachineId() {
        return machineId;
    }

    public void setMachineId(Long machineId) {
        this.machineId = machineId;
    }

    public Double getHoursUsed() {
        return hoursUsed;
    }

    public void setHoursUsed(Double hoursUsed) {
        this.hoursUsed = hoursUsed;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}