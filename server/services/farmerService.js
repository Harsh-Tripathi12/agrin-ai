import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase.js";


// ============================================
// COLLECTION REFERENCES
// ============================================

const farmersCollection =
    collection(db, "farmers");

const farmsCollection =
    collection(db, "farms");


// ============================================
// CREATE FARMER
// ============================================

export async function createFarmer(
    farmerId,
    farmerData
) {
    const farmerRef =
        doc(farmersCollection, farmerId);


    const now =
        new Date().toISOString();


    const farmer = {
        id: farmerId,

        name:
            farmerData.name || "",

        phone:
            farmerData.phone || "",

        language:
            farmerData.language || "en",

        location:
            farmerData.location || null,

        createdAt: now,

        updatedAt: now,
    };


    await setDoc(
        farmerRef,
        farmer
    );


    return farmer;
}


// ============================================
// GET FARMER
// ============================================

export async function getFarmer(
    farmerId
) {
    const farmerRef =
        doc(farmersCollection, farmerId);


    const snapshot =
        await getDoc(farmerRef);


    if (!snapshot.exists()) {

        throw new Error(
            "Farmer not found"
        );
    }


    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}


// ============================================
// UPDATE FARMER
// ============================================

export async function updateFarmer(
    farmerId,
    farmerData
) {
    const farmerRef =
        doc(farmersCollection, farmerId);


    const snapshot =
        await getDoc(farmerRef);


    if (!snapshot.exists()) {

        throw new Error(
            "Farmer not found"
        );
    }


    const updateData = {
        ...farmerData,

        updatedAt:
            new Date().toISOString(),
    };


    // Never allow the client to
    // overwrite the Firestore ID.
    delete updateData.id;


    await updateDoc(
        farmerRef,
        updateData
    );


    return getFarmer(
        farmerId
    );
}


// ============================================
// CREATE FARM
// ============================================

export async function createFarm(
    farmerId,
    farmData
) {
    // First make sure the farmer exists.

    const farmerRef =
        doc(farmersCollection, farmerId);


    const farmerSnapshot =
        await getDoc(farmerRef);


    if (!farmerSnapshot.exists()) {

        throw new Error(
            "Farmer not found"
        );
    }


    const farmRef =
        doc(farmsCollection);


    const now =
        new Date().toISOString();


    const farm = {
        id: farmRef.id,

        farmerId,

        farmName:
            farmData.farmName || "",

        landSize:
            farmData.landSize || 0,

        landUnit:
            farmData.landUnit || "acre",

        soilType:
            farmData.soilType || "",

        irrigationType:
            farmData.irrigationType || "",

        crops:
            Array.isArray(farmData.crops)
                ? farmData.crops
                : [],

        location:
            farmData.location || null,

        createdAt: now,

        updatedAt: now,
    };


    await setDoc(
        farmRef,
        farm
    );


    return farm;
}


// ============================================
// GET ALL FARMS FOR FARMER
// ============================================

export async function getFarmsByFarmer(
    farmerId
) {
    const q = query(
        farmsCollection,
        where(
            "farmerId",
            "==",
            farmerId
        )
    );

    const snapshot =
        await getDocs(q);


    const farms =
        snapshot.docs.map(
            (doc) => ({
                id: doc.id,
                ...doc.data(),
            })
        );


    return farms;
}