package com.maintainit.service;

import com.maintainit.dto.UsageLogDTO;
import com.maintainit.entity.Machine;
import com.maintainit.entity.UsageLog;
import com.maintainit.exception.ResourceNotFoundException;
import com.maintainit.repository.MachineRepository;
import com.maintainit.repository.UsageLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsageLogService {

    private final UsageLogRepository usageLogRepository;
    private final MachineRepository machineRepository;

    public UsageLogService(
            UsageLogRepository usageLogRepository,
            MachineRepository machineRepository) {

        this.usageLogRepository = usageLogRepository;
        this.machineRepository = machineRepository;
    }


    // =========================================================
    // CREATE USAGE LOG
    // =========================================================

    public UsageLog createUsageLog(UsageLogDTO dto) {

        Machine machine = machineRepository.findById(dto.getMachineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Machine not found with id: "
                                        + dto.getMachineId()
                        )
                );


        UsageLog usageLog = new UsageLog();

        usageLog.setMachine(machine);
        usageLog.setHoursUsed(dto.getHoursUsed());
        usageLog.setUsageDate(dto.getUsageDate());
        usageLog.setDescription(dto.getDescription());


        // Get current machine usage
        double currentHours =
                machine.getCurrentUsageHours() == null
                        ? 0
                        : machine.getCurrentUsageHours();


        // Add newly recorded usage
        double updatedHours =
                currentHours + dto.getHoursUsed();


        machine.setCurrentUsageHours(updatedHours);


        // Save updated machine
        machineRepository.save(machine);


        // Save usage log
        return usageLogRepository.save(usageLog);
    }


    // =========================================================
    // GET ALL USAGE LOGS
    // =========================================================

    public List<UsageLog> getAllUsageLogs() {

        return usageLogRepository.findAll();
    }


    // =========================================================
    // GET USAGE LOG BY ID
    // =========================================================

    public UsageLog getUsageLogById(Long id) {

        return usageLogRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usage log not found with id: " + id
                        )
                );
    }


    // =========================================================
    // DELETE USAGE LOG
    // =========================================================

    public void deleteUsageLog(Long id) {

        // Find the usage log
        UsageLog usageLog = getUsageLogById(id);


        // Get the machine associated with the log
        Machine machine = usageLog.getMachine();


        // Get current machine usage
        double currentHours =
                machine.getCurrentUsageHours() == null
                        ? 0
                        : machine.getCurrentUsageHours();


        // Get the hours recorded in this log
        double loggedHours =
                usageLog.getHoursUsed() == null
                        ? 0
                        : usageLog.getHoursUsed();


        // Subtract the deleted log's hours
        double updatedHours =
                Math.max(currentHours - loggedHours, 0);


        // Update machine usage
        machine.setCurrentUsageHours(updatedHours);


        // Save updated machine
        machineRepository.save(machine);


        // Finally delete the usage log
        usageLogRepository.delete(usageLog);
    }
}