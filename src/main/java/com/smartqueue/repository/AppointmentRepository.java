
package com.smartqueue.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartqueue.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByTokenNumber(String tokenNumber);

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.appointmentDate = :date
        AND a.serviceType = :serviceType
        AND a.status = 'WAITING'
        AND (
            a.appointmentTime < :time
            OR (a.appointmentTime = :time AND a.id < :id)
        )
    """)
    long countPeopleAhead(
        @Param("date") java.time.LocalDate date,
        @Param("serviceType") String serviceType,
        @Param("time") java.time.LocalTime time,
        @Param("id") Long id
    );
}
