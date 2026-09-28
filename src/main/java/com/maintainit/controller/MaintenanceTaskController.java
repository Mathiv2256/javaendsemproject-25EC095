package com.maintainit.controller;

import com.maintainit.dto.MaintenanceTaskDTO;
import com.maintainit.entity.MaintenanceTask;
import com.maintainit.service.MaintenanceTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-tasks")
@CrossOrigin
public class MaintenanceTaskController {

    private final MaintenanceTaskService maintenanceTaskService;

    public MaintenanceTaskController(
            MaintenanceTaskService maintenanceTaskService) {
        this.maintenanceTaskService = maintenanceTaskService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceTask> createTask(
            @Valid @RequestBody MaintenanceTaskDTO dto) {

        MaintenanceTask task = maintenanceTaskService.createTask(dto);

        return new ResponseEntity<>(
                task,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceTask>> getAllTasks() {

        return ResponseEntity.ok(
                maintenanceTaskService.getAllTasks()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTask> getTaskById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceTaskService.getTaskById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceTask> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceTaskDTO dto) {

        return ResponseEntity.ok(
                maintenanceTaskService.updateTask(id, dto)
        );
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<MaintenanceTask> completeTask(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceTaskService.completeTask(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long id) {

        maintenanceTaskService.deleteTask(id);

        return ResponseEntity.ok(
                "Maintenance task deleted successfully"
        );
    }
}