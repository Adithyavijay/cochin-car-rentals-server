    // src/graphql/shared/shared-types.js

    import { gql } from "apollo-server-express";

    export const sharedTypes = gql`
        # Vehicle and related types that both admin and user need
        type Vehicle {
            id: ID!
            name: String!
            manufacturer: Manufacturer!
            model: Model!
            dailyRate: Float!
            availableQuantity: Int!
            primaryImage: String!
            otherImages: [String!]!
            category: VehicleCategory!
            description: String
            transmission: TransmissionType!
            seatingCapacity: Int!
            yearOfManufacture: Int!
            maintenanceStatus: MaintenanceStatus!
            fuelType : FuelType!
        }

        type Manufacturer {
            id: ID!
            name: String!
        }

        type Model {
            id: ID!
            name: String!
            manufacturer: Manufacturer!
        }

        enum VehicleCategory {
            ECONOMY
            COMPACT
            MIDSIZE
            FULLSIZE
            LUXURY
            SUV
            VAN
            TRUCK
        }

        enum TransmissionType {
            MANUAL
            AUTOMATIC
            SEMI_AUTOMATIC
        }

        enum MaintenanceStatus {
            EXCELLENT
            GOOD
            NEEDS_SERVICE
            IN_MAINTENANCE
        }
        enum FuelType {
            PETROL
            DIESEL
            HYBRID
            ELECTRIC
    }

    enum AvailabilityStatus {
    AVAILABLE
    QUEUED
    UNAVAILABLE
}



    `;
