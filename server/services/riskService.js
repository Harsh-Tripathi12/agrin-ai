function addRisk(
    risks,
    type,
    severity,
    title,
    message,
    action
) {

    risks.push({
        type,
        severity,
        title,
        message,
        action,
    });
}


export function calculateFarmRisk({
    farm,
    weather,
}) {

    const risks = [];


    if (!weather) {
        return {
            overallRisk: "unknown",
            risks: [],
            generatedAt:
                new Date().toISOString(),
        };
    }


    const temperature =
        Number(
            weather.current?.temperature
        );


    const humidity =
        Number(
            weather.current?.humidity
        );


    const rain =
        Number(
            weather.current?.rain
        );


    const rainProbability =
        Math.max(
            ...(weather.forecast || [])
                .map(
                    (day) =>
                        Number(
                            day.rainProbability || 0
                        )
                ),
            0
        );


    const precipitation =
        Math.max(
            ...(weather.forecast || [])
                .map(
                    (day) =>
                        Number(
                            day.precipitation || 0
                        )
                ),
            0
        );


    // HEAT

    if (temperature >= 40) {

        addRisk(
            risks,
            "heat",
            "high",
            "High heat stress",
            "Very high temperature may stress crops and increase water demand.",
            "Check irrigation and avoid unnecessary field work during peak heat."
        );

    } else if (temperature >= 35) {

        addRisk(
            risks,
            "heat",
            "medium",
            "Heat stress possible",
            "High temperature can increase crop water requirements.",
            "Monitor soil moisture and irrigate according to crop need."
        );
    }


    // HEAVY RAIN

    if (
        precipitation >= 50 ||
        rainProbability >= 80
    ) {

        addRisk(
            risks,
            "heavy_rain",
            "high",
            "Heavy rain risk",
            "Forecast indicates significant rainfall.",
            "Check field drainage and avoid unnecessary irrigation before rainfall."
        );

    } else if (
        precipitation >= 20 ||
        rainProbability >= 60
    ) {

        addRisk(
            risks,
            "rain",
            "medium",
            "Rain likely",
            "Rain may affect field operations.",
            "Monitor drainage and postpone non-essential spraying."
        );
    }


    // HUMIDITY / DISEASE

    if (
        humidity >= 85 &&
        temperature >= 20
    ) {

        addRisk(
            risks,
            "disease",
            "medium",
            "Disease-friendly conditions",
            "High humidity with warm temperatures can increase some disease risks.",
            "Inspect leaves regularly and improve airflow where possible."
        );
    }


    // WATER

    if (
        temperature >= 35 &&
        rainProbability < 30
    ) {

        addRisk(
            risks,
            "water",
            "medium",
            "Water stress possible",
            "Hot conditions with low rain probability may increase water demand.",
            "Check soil moisture before deciding irrigation."
        );
    }


    let overallRisk =
        "low";


    if (
        risks.some(
            (risk) =>
                risk.severity === "high"
        )
    ) {

        overallRisk =
            "high";

    } else if (
        risks.some(
            (risk) =>
                risk.severity === "medium"
        )
    ) {

        overallRisk =
            "medium";
    }


    return {

        overallRisk,

        risks,

        farmId:
            farm?.id || null,

        generatedAt:
            new Date().toISOString(),

    };
}