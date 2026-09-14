const GEOCODING_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_URL =
    "https://api.open-meteo.com/v1/forecast";


const WEATHER_DESCRIPTIONS = {
    0: "Clear sky",

    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",

    45: "Fog",
    48: "Depositing rime fog",

    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",

    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",

    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",

    66: "Light freezing rain",
    67: "Heavy freezing rain",

    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",

    77: "Snow grains",

    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",

    85: "Slight snow showers",
    86: "Heavy snow showers",

    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};


function getWeatherDescription(code) {
    return (
        WEATHER_DESCRIPTIONS[code] ||
        "Unknown weather"
    );
}


async function geocodeLocation(
    district,
    state
) {
    const fetchResults = async (queryText) => {
        const url = new URL(GEOCODING_URL);
        url.searchParams.set("name", queryText);
        url.searchParams.set("count", "10");
        url.searchParams.set("language", "en");
        url.searchParams.set("format", "json");
        url.searchParams.set("countryCode", "IN");

        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    };

    let results = await fetchResults(`${district}, ${state}`);
    if (results.length === 0) {
        results = await fetchResults(district);
    }
    if (results.length === 0) {
        results = await fetchResults(state);
    }

    if (!results || results.length === 0) {
        throw new Error(
            `Could not find weather location for ${district}, ${state}`
        );
    }

    // Prefer a result whose admin1 matches the provided state
    const stateMatch = results.find(
        (result) =>
            result.admin1?.toLowerCase() === state.toLowerCase()
    );

    return stateMatch || results[0];
}


export async function getWeatherByLocation(
    district,
    state
) {

    if (!district || !state) {
        throw new Error(
            "District and state are required"
        );
    }


    const location =
        await geocodeLocation(
            district,
            state
        );


    const url = new URL(
        WEATHER_URL
    );


    url.searchParams.set(
        "latitude",
        location.latitude
    );

    url.searchParams.set(
        "longitude",
        location.longitude
    );


    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
        ].join(",")
    );


    url.searchParams.set(
        "daily",
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
        ].join(",")
    );


    url.searchParams.set(
        "forecast_days",
        "7"
    );


    url.searchParams.set(
        "timezone",
        "auto"
    );


    url.searchParams.set(
        "temperature_unit",
        "celsius"
    );


    url.searchParams.set(
        "wind_speed_unit",
        "kmh"
    );


    url.searchParams.set(
        "precipitation_unit",
        "mm"
    );


    const response = await fetch(url);


    if (!response.ok) {
        throw new Error(
            "Weather API request failed"
        );
    }


    const data = await response.json();


    return {
        location: {
            name: district || location.name,
            district: district || location.admin2 || location.name,
            state: state || location.admin1,
            matchedName: location.name,
            matchedDistrict: location.admin2 || null,
            matchedState: location.admin1 || null,
            country: location.country || "India",
            latitude: location.latitude,
            longitude: location.longitude,
        },

        current: {
            temperature:
                data.current.temperature_2m,

            feelsLike:
                data.current.apparent_temperature,

            humidity:
                data.current.relative_humidity_2m,

            precipitation:
                data.current.precipitation,

            rain:
                data.current.rain,

            windSpeed:
                data.current.wind_speed_10m,

            weatherCode:
                data.current.weather_code,

            condition:
                getWeatherDescription(
                    data.current.weather_code
                ),

            time:
                data.current.time,
        },

        forecast:
            data.daily.time.map(
                (date, index) => ({
                    date,

                    weatherCode:
                        data.daily.weather_code[index],

                    condition:
                        getWeatherDescription(
                            data.daily.weather_code[index]
                        ),

                    maxTemperature:
                        data.daily
                            .temperature_2m_max[index],

                    minTemperature:
                        data.daily
                            .temperature_2m_min[index],

                    precipitation:
                        data.daily
                            .precipitation_sum[index],

                    rainProbability:
                        data.daily
                            .precipitation_probability_max[index],
                })
            ),

        timezone:
            data.timezone,
    };
}