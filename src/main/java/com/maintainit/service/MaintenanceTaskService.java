package com.maintainit.service;

import com.maintainit.dto.MaintenanceTaskDTO;
import com.maintainit.entity.Machine;
import com.maintainit.entity.MaintenanceTask;
import com.maintainit.entity.Technician;
import com.maintainit.exception.ResourceNotFoundException;
import com.maintainit.repository.MachineRepository;
import com.maintainit.repository.MaintenanceTaskRepository;
import com.maintainit.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final MachineRepository machineRepository;
    private final TechnicianRepository technicianRepository;

    public MaintenanceTaskService(
            MaintenanceTaskRepository maintenanceTaskRepository,
            MachineRepository machineRepository,
            TechnicianRepository technicianRepository) {

        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.machineRepository = machineRepository;
        this.technicianRepository = technicianRepository;
    }

    public MaintenanceTask createTask(MaintenanceTaskDTO dto) {

        Machine machine = machineRepository.findById(dto.getMachineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Machine not found with id: " + dto.getMachineId()
                        ));

        Technician technician = technicianRepository.findById(dto.getTechnicianId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found with id: " + dto.getTechnicianId()
                        ));

        if (maintenanceTaskRepository
                .findByMachineAndStatus(machine, "OPEN")
                .isPresent()) {

            throw new RuntimeException(
                    "An open maintenance task already exists for this machine."
            );
        }

        MaintenanceTask task = new MaintenanceTask();

        task.setMachine(machine);
        task.setTechnician(technician);
        task.setTaskDescription(dto.getTaskDescription());
        task.setScheduledDate(dto.getScheduledDate());
        task.setCompletedDate(dto.getCompletedDate());
        task.setStatus(dto.getStatus());
        task.setNotes(dto.getNotes());

        return maintenanceTaskRepository.save(task);
    }

    public List<MaintenanceTask> getAllTasks() {
        return maintenanceTaskRepository.findAll();
    }

    public MaintenanceTask getTaskById(Long id) {

        return maintenanceTaskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance task not found with id: " + id
                        ));
    }

    public MaintenanceTask updateTask(
            Long id,
            MaintenanceTaskDTO dto) {

        MaintenanceTask task = getTaskById(id);

        Machine machine = machineRepository.findById(dto.getMachineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Machine not found with id: " + dto.getMachineId()
                        ));

        Technician technician = technicianRepository.findById(dto.getTechnicianId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found with id: " + dto.getTechnicianId()
                        ));

        task.setMachine(machine);
        task.setTechnician(technician);
        task.setTaskDescription(dto.getTaskDescription());
        task.setScheduledDate(dto.getScheduledDate());
        task.setCompletedDate(dto.getCompletedDate());
        task.setStatus(dto.getStatus());
        task.setNotes(dto.getNotes());

        return maintenanceTaskRepository.save(task);
    }

    public MaintenanceTask completeTask(Long id) {

        MaintenanceTask task = getTaskById(id);

        task.setStatus("COMPLETED");
        task.setCompletedDate(LocalDate.now());

        Machine machine = task.getMachine();

        machine.setCurrentUsageHours(0.0);

        machineRepository.save(machine);

        return maintenanceTaskRepository.save(task);
    }

    public void deleteTask(Long id) {

        MaintenanceTask task = getTaskById(id);

        maintenanceTaskRepository.delete(task);
    }
}