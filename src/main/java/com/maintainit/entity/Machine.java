package com.maintainit.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "machines")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String machineName;

    private String machineCode;

    private String model;

    private String manufacturer;

    private Double currentUsageHours;

    private Double maintenanceIntervalHours;

    public Machine() {
    }

    public Machine(String machineName, String machineCode, String model,
                   String manufacturer, Double currentUsageHours,
                   Double maintenanceIntervalHours) {
        this.machineName = machineName;
        this.machineCode = machineCode;
        this.model = model;
        this.manufacturer = manufacturer;
        this.currentUsageHours = currentUsageHours;
        this.maintenanceIntervalHours = maintenanceIntervalHours;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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