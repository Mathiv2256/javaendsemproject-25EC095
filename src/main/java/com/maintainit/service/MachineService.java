package com.maintainit.service;

import com.maintainit.dto.MachineDTO;
import com.maintainit.entity.Machine;
import com.maintainit.exception.ResourceNotFoundException;
import com.maintainit.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MachineService {

    private final MachineRepository machineRepository;

    public MachineService(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

    public Machine createMachine(MachineDTO dto) {

        Machine machine = new Machine();

        machine.setMachineName(dto.getMachineName());
        machine.setMachineCode(dto.getMachineCode());
        machine.setModel(dto.getModel());
        machine.setManufacturer(dto.getManufacturer());
        machine.setCurrentUsageHours(dto.getCurrentUsageHours());
        machine.setMaintenanceIntervalHours(dto.getMaintenanceIntervalHours());

        return machineRepository.save(machine);
    }

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(Long id) {

        return machineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Machine not found with id: " + id
                        ));
    }

    public Machine updateMachine(Long id, MachineDTO dto) {

        Machine machine = getMachineById(id);

        machine.setMachineName(dto.getMachineName());
        machine.setMachineCode(dto.getMachineCode());
        machine.setModel(dto.getModel());
        machine.setManufacturer(dto.getManufacturer());
        machine.setCurrentUsageHours(dto.getCurrentUsageHours());
        machine.setMaintenanceIntervalHours(dto.getMaintenanceIntervalHours());

        return machineRepository.save(machine);
    }

    public void deleteMachine(Long id) {

        Machine machine = getMachineById(id);

        machineRepository.delete(machine);
    }

    public Map<String, Object> getMaintenanceStatus(Long id) {

        Machine machine = getMachineById(id);

        double currentUsage =
                machine.getCurrentUsageHours() == null
                        ? 0
                        : machine.getCurrentUsageHours();

        double maintenanceInterval =
                machine.getMaintenanceIntervalHours() == null
                        ? 0
                        : machine.getMaintenanceIntervalHours();

        String status;

        if (maintenanceInterval <= 0) {
            status = "NOT_CONFIGURED";
        } else if (currentUsage >= maintenanceInterval) {
            status = "DUE";
        } else if (currentUsage >= maintenanceInterval * 0.90) {
            status = "APPROACHING";
        } else {
            status = "NORMAL";
        }

        double remainingHours =
                Math.max(maintenanceInterval - currentUsage, 0);

        Map<String, Object> result = new HashMap<>();

        result.put("machineId", machine.getId());
        result.put("machineName", machine.getMachineName());
        result.put("currentUsageHours", currentUsage);
        result.put("maintenanceIntervalHours", maintenanceInterval);
        result.put("remainingHours", remainingHours);
        result.put("status", status);

        return result;
    }
}