import {
    createFarmer as createFarmerService,
    getFarmer as getFarmerService,
    updateFarmer as updateFarmerService,
    createFarm as createFarmService,
    getFarmsByFarmer
} from "../services/farmerService.js";


export async function createFarmer(req, res) {
    try {
        const farmerId = req.user.uid;

        const farmer = await createFarmerService(
            farmerId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Farmer created successfully",
            data: farmer
        });

    } catch (error) {
        console.error("Create farmer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create farmer"
        });
    }
}


export async function getFarmer(req, res) {
    try {
        const farmerId =
            req.user.uid;

        const farmer = await getFarmerService(farmerId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        res.json({
            success: true,
            data: farmer
        });

    } catch (error) {
        console.error("Get farmer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get farmer"
        });
    }
}


export async function updateFarmer(req, res) {
    try {
        const farmerId =
            req.user.uid;

        const farmer = await updateFarmerService(
            farmerId,
            req.body
        );

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        res.json({
            success: true,
            message: "Farmer updated successfully",
            data: farmer
        });

    } catch (error) {
        console.error("Update farmer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update farmer"
        });
    }
}


export async function createFarm(req, res) {
    try {
        const farmerId =
            req.user.uid;

        const farm = await createFarmService(
            farmerId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Farm created successfully",
            data: farm
        });

    } catch (error) {
        console.error("Create farm error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create farm"
        });
    }
}


export async function getFarms(req, res) {
    try {
        const farmerId =
            req.user.uid;

        const farms = await getFarmsByFarmer(farmerId);

        res.json({
            success: true,
            data: farms
        });

    } catch (error) {
        console.error("Get farms error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get farms"
        });
    }
}