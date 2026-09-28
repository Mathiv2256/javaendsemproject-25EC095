package com.maintainit.repository;

import com.maintainit.entity.MaintenanceTask;
import com.maintainit.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {

    Optional<MaintenanceTask> findByMachineAndStatus(Machine machine, String status);

}
