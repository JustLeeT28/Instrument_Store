package com.store.be_api.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, UUID> {
    Optional<Address> findFirstByUserIdOrderByDefaultAddressDescUpdatedAtDescCreatedAtDesc(UUID userId);
}
