package com.maintainit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class MachineDTO {

    @NotBlank(message = "Machine name is required")
    private String machineName;

    @NotBlank(message = "Machine code is required")
    private String machineCode;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    @NotNull(message = "Current usage hours is required")
    @PositiveOrZero(message = "Current usage hours cannot be negative")
    private Double currentUsageHours;

    @NotNull(message = "Maintenance interval is required")
    @PositiveOrZero(message = "Maintenance interval cannot be negative")
    private Double maintenanceIntervalHours;

    public MachineDTO() {
    }

    public MachineDTO(String machineName, String machineCode, String model,
                      String manufacturer, Double currentUsageHours,
                      Double maintenanceIntervalHours) {
        this.machineName = machineName;
        this.machineCode = machineCode;
        this.model = model;
        this.manufacturer = manufacturer;
        this.currentUsageHours = currentUsageHours;
        this.maintenanceIntervalHours = maintenanceIntervalHours;
    }

    public String getMachineName() {
        return machineName;
    }

    public void setMachineName(String machineName) {
        this.machineName = machineName;
    }

    public String getMachineCode() {
        return machineCode;
    }

    public void setMachineCode(String machineCode) {
        this.machineCode = machineCode;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public Double getCurrentUsageHours() {
        return currentUsageHours;
    }

    public void setCurrentUsageHours(Double currentUsageHours) {
        this.currentUsageHours = currentUsageHours;
    }

    public Double getMaintenanceIntervalHours() {
        return maintenanceIntervalHours;
    }

    public void setMaintenanceIntervalHours(Double maintenanceIntervalHours) {
        this.maintenanceIntervalHours = maintenanceIntervalHours;
    }
}