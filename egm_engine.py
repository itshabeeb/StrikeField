import numpy as np


def estimate_location_parameters(latitude, longitude):
    """Return transparent planning estimates when no local lightning dataset is configured.

    Ground flash density varies significantly with local climate and terrain. These
    latitude bands are a useful starting point, not a substitute for an official
    lightning-risk map or site survey.
    """
    del longitude

    if abs(latitude) < 15:
        ground_flash_density = 12.0
        region = "tropical"
    elif abs(latitude) < 30:
        ground_flash_density = 8.0
        region = "subtropical"
    elif abs(latitude) < 50:
        ground_flash_density = 4.0
        region = "temperate"
    elif abs(latitude) < 70:
        ground_flash_density = 1.5
        region = "cool temperate"
    else:
        ground_flash_density = 0.5
        region = "polar"

    return {
        "ground_flash_density": ground_flash_density,
        "peak_stroke_current": 31.0,
        "region": region,
        "source": "latitude-band planning estimate",
    }


def estimate_low_pressure_potential(latitude):
    """Return a broad climatological screen for tropical low-pressure development.

    This is not a forecast. Formation also depends on sea-surface temperature,
    moisture, wind shear, upper-air divergence, and a pre-existing disturbance.
    """
    latitude_abs = abs(latitude)

    if latitude_abs < 5:
        potential, label = "low", "Low"
        explanation = "Very near the equator, where weak Coriolis force limits organized rotation."
    elif latitude_abs < 20:
        potential, label = "high", "High"
        explanation = "Warm tropical latitudes can support rising moist air and organized rotation."
    elif latitude_abs < 30:
        potential, label = "moderate", "Moderate"
        explanation = "Warm air may support development, but conditions vary strongly by season and basin."
    elif latitude_abs < 60:
        potential, label = "moderate", "Moderate"
        explanation = "Low-pressure systems are common, though this screen does not assess storm formation."
    else:
        potential, label = "low", "Low"
        explanation = "Cold, dry conditions generally provide less support for tropical development."

    return {
        "potential": potential,
        "label": label,
        "explanation": explanation,
        "source": "latitude-only climatological screen",
    }


def calculate_lightning_risk(height, n_g, c_d, current_ka):
    """
    Calculates preliminary lightning metrics using EGM-style screening formulas.

    The output supports an initial discussion under the IS/IEC 62305 risk
    management framework; it is not a complete IS/IEC 62305 assessment.
    """
    # 1. Striking Distance (IEEE 1410): S = 10 * I^0.65
    striking_distance = 10.0 * (current_ka ** 0.65)
    
    # 2. Collection Radius (Rc = 3 * H for isolated pole)
    r_c = 3.0 * height
    
    # 3. Equivalent Collection Area Ac (in km^2)
    a_c = (np.pi * (r_c ** 2)) * 1e-6
    
    # 4. Expected Annual Direct Strikes (Nd)
    n_d = n_g * a_c * c_d
    
    # 5. Return period in years
    return_period = (1.0 / n_d) if n_d > 0 else float('inf')
    
    # 6. Risk Level (IEC 62305 classification)
    if n_d < 1e-3:
        risk_level = "Low Risk (< 1 strike per 1,000 yrs)"
        status_color = "green"
    elif n_d < 1e-2:
        risk_level = "Moderate Risk (1 strike per 100-1,000 yrs)"
        status_color = "orange"
    else:
        risk_level = "High Risk (> 1 strike per 100 yrs)"
        status_color = "red"
        
    return {
        "striking_distance": striking_distance,
        "collection_radius": r_c,
        "collection_area_km2": a_c,
        "expected_strikes_per_yr": n_d,
        "return_period_yrs": return_period,
        "risk_level": risk_level,
        "status_color": status_color
    }