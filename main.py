import streamlit as st
import numpy as np
import plotly.graph_objects as go
from egm_engine import calculate_lightning_risk

try:
    from egm_engine import estimate_low_pressure_potential
except ImportError:
    def estimate_low_pressure_potential(latitude):
        """Compatibility fallback for a Streamlit process with a stale module cache."""
        latitude_abs = abs(latitude)
        if latitude_abs < 5:
            potential, label = "low", "Low"
            explanation = "Very near the equator, where weak Coriolis force limits organized rotation."
        elif latitude_abs < 20:
            potential, label = "high", "High"
            explanation = "Warm tropical latitudes can support rising moist air and organized rotation."
        elif latitude_abs < 60:
            potential, label = "moderate", "Moderate"
            explanation = "Conditions vary strongly by season, basin, and the current weather pattern."
        else:
            potential, label = "low", "Low"
            explanation = "Cold, dry conditions generally provide less support for tropical development."
        return {
            "potential": potential,
            "label": label,
            "explanation": explanation,
            "source": "latitude-only climatological screen",
        }

try:
    from egm_engine import estimate_location_parameters
except ImportError:
    def estimate_location_parameters(latitude, longitude):
        """Compatibility fallback for a Streamlit process with a stale module cache."""
        del longitude
        latitude_abs = abs(latitude)
        if latitude_abs < 15:
            ground_flash_density, region = 12.0, "tropical"
        elif latitude_abs < 30:
            ground_flash_density, region = 8.0, "subtropical"
        elif latitude_abs < 50:
            ground_flash_density, region = 4.0, "temperate"
        elif latitude_abs < 70:
            ground_flash_density, region = 1.5, "cool temperate"
        else:
            ground_flash_density, region = 0.5, "polar"
        return {
            "ground_flash_density": ground_flash_density,
            "peak_stroke_current": 31.0,
            "region": region,
            "source": "latitude-band planning estimate",
        }

try:
    from streamlit_geolocation import streamlit_geolocation
except ImportError:
    streamlit_geolocation = None

st.set_page_config(page_title="Lightning Strike Analysis", layout="wide")

st.markdown(
    """
    <style>
    .stApp {
        background: linear-gradient(135deg, #f8fbff 0%, #eef4fb 100%);
    }
    [data-testid="stSidebar"] {
        background: #10233f;
    }
    [data-testid="stSidebar"] * {
        color: #eef5ff;
    }
    [data-testid="stSidebar"] .stCaption {
        color: #b7c8df;
    }
    .hero {
        padding: 2rem 2.25rem;
        margin: 0 0 1.5rem;
        border-radius: 22px;
        color: white;
        background: linear-gradient(120deg, #10233f 0%, #1d4e89 58%, #247ba0 100%);
        box-shadow: 0 14px 30px rgba(16, 35, 63, 0.18);
    }
    .hero h1 {
        margin: 0;
        font-size: clamp(2rem, 5vw, 3.4rem);
        letter-spacing: -0.04em;
    }
    .hero p {
        max-width: 720px;
        margin: 0.65rem 0 0;
        color: #dcecff;
        font-size: 1.05rem;
    }
    [data-testid="stMetric"] {
        min-height: 120px;
        padding: 1rem 1.1rem;
        border: 1px solid #dce7f3;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 6px 18px rgba(28, 62, 96, 0.08);
    }
    [data-testid="stMetricLabel"] {
        color: #52657d;
    }
    [data-testid="stMetricValue"] {
        color: #10233f;
    }
    .location-card {
        padding: 0.9rem 1.1rem;
        border-left: 5px solid #f4a261;
        border-radius: 12px;
        background: #fff8ed;
        color: #5a401f;
    }
    .section-title {
        color: #10233f;
        font-size: 1.35rem;
        font-weight: 700;
        margin: 1.5rem 0 0.35rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <h1>Lightning Risk Check</h1>
        <p>Understand lightning exposure for a pole, building, or tall structure
        using your location and a simple, visual engineering estimate.</p>
    </div>
    """,
    unsafe_allow_html=True,
)
st.write(
    "Set the site details in the sidebar. GPS is optional, and manual coordinates "
    "are available when location access is unavailable."
)
with st.expander("Standards reference: IS/IEC 62305"):
    st.markdown(
        "**IS/IEC 62305** is the Indian Standard adoption of the IEC lightning "
        "protection series by the Bureau of Indian Standards (BIS). The relevant "
        "parts include:"
    )
    st.markdown(
        "- **Part 1:** General principles\n"
        "- **Part 2:** Risk management\n"
        "- **Part 3:** Physical damage to structures and life hazard\n"
        "- **Part 4:** Electrical and electronic systems within structures"
    )
    st.warning(
        "This app is a preliminary screening tool. It does not perform the full "
        "IS/IEC 62305 risk assessment, determine lightning protection level (LPL), "
        "or certify a lightning protection system. Use the applicable BIS edition "
        "and a qualified professional for final design."
    )

# Sidebar - Site inputs
st.sidebar.header("Site details")

height = st.sidebar.slider("Pole Height H (meters)", min_value=5.0, max_value=50.0, value=15.0, step=1.0)

c_d_option = st.sidebar.selectbox(
    "How exposed is the site?",
    options=[
        ("Sheltered by taller buildings or trees", 0.25),
        ("Among buildings or trees of similar height", 0.50),
        ("Standing alone on level ground", 1.00),
        ("Standing alone on a hill or high ground", 2.00)
    ],
    format_func=lambda x: x[0]
)
c_d = c_d_option[1]

location = None
if streamlit_geolocation is not None:
    st.sidebar.subheader("Site location")
    st.sidebar.caption("GPS is used to choose a regional planning estimate.")
    if st.sidebar.button("Use my current location"):
        st.session_state["request_location"] = True
    request_location = st.session_state.get("request_location", False)
    first_location_attempt = (
        "location_attempted" not in st.session_state
        and "location" not in st.session_state
    )
    if request_location or first_location_attempt:
        st.session_state["location_attempted"] = True
        location = streamlit_geolocation()
    else:
        location = st.session_state.get("location")
    if location and location.get("latitude") is not None and location.get("longitude") is not None:
        st.session_state["location"] = location
        st.session_state["request_location"] = False

with st.sidebar.expander("Enter coordinates manually"):
    manual_latitude = st.number_input("Latitude", min_value=-90.0, max_value=90.0, value=0.0, step=0.0001)
    manual_longitude = st.number_input("Longitude", min_value=-180.0, max_value=180.0, value=0.0, step=0.0001)
    use_manual_coordinates = st.checkbox("Use these coordinates", value=False)

if use_manual_coordinates:
    latitude, longitude = manual_latitude, manual_longitude
    location_source = "manual coordinates"
elif location and location.get("latitude") is not None and location.get("longitude") is not None:
    latitude = float(location["latitude"])
    longitude = float(location["longitude"])
    location_source = "current location"
else:
    latitude, longitude = 20.0, 0.0
    location_source = "general estimate"

location_parameters = estimate_location_parameters(latitude, longitude)
n_g = location_parameters["ground_flash_density"]
current_ka = location_parameters["peak_stroke_current"]
low_pressure = estimate_low_pressure_potential(latitude)

with st.sidebar.expander("Advanced: adjust the engineering assumptions"):
    st.caption("Use these only when you have values from a local lightning-risk study.")
    n_g = st.number_input(
        "Lightning activity (flashes/km²/year)",
        min_value=0.1,
        max_value=50.0,
        value=n_g,
        step=0.5,
    )
    current_ka = st.number_input(
        "Typical peak current (kA)",
        min_value=2.0,
        max_value=100.0,
        value=current_ka,
        step=1.0,
    )

st.markdown(
    f"""
    <div class="location-card">
        <strong>Location basis:</strong> {location_source.title()} at
        {latitude:.4f}, {longitude:.4f}<br>
        <strong>Regional estimate:</strong> {location_parameters['region'].title()}
        conditions, {n_g:g} lightning flashes/km²/year
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="section-title">Low-pressure development check</div>', unsafe_allow_html=True)
st.info(
    f"**{low_pressure['label']} broad potential.** {low_pressure['explanation']} "
    "This is a latitude-only climatological screen, not a weather forecast and "
    "not an adjustment to the lightning strike estimate."
)

# Run Calculations
results = calculate_lightning_risk(height, n_g, c_d, current_ka)

# Layout: Metrics Display
col1, col2, col3, col4 = st.columns(4)
col1.metric("Lightning reach", f"{results['striking_distance']:.1f} m")
col2.metric("Area considered", f"{results['collection_area_km2'] * 1e6:,.0f} m²")
col3.metric("Estimated direct strikes", f"{results['expected_strikes_per_yr']:.4f} / year")
if np.isfinite(results["return_period_yrs"]):
    col4.metric("Typical wait between strikes", f"{results['return_period_yrs']:,.0f} years")
else:
    col4.metric("Typical wait between strikes", "Not expected")

st.caption(
    "These are planning estimates. A local lightning map and a qualified electrical "
    "engineer should be used for final protection decisions. Reference framework: "
    "IS/IEC 62305 (BIS adoption of IEC 62305)."
)

st.markdown(
    f'<div class="section-title">Risk classification</div>'
    f'<span style="font-size:1.05rem"><strong>{results["risk_level"]}</strong></span>',
    unsafe_allow_html=True,
)

# Plain-language site scene
st.markdown('<div class="section-title">What the site looks like</div>', unsafe_allow_html=True)
st.caption("This illustration reflects your selected exposure setting; it is not a map or a construction drawing.")

scene = go.Figure()
scene_limit = max(45, height * 2.2)

if c_d == 0.25:
    surroundings = "Taller trees and structures shelter the pole"
    tree_heights = [height * 1.45, height * 1.7, height * 1.35, height * 1.55]
    tree_positions = [-38, -22, 23, 39]
elif c_d == 0.50:
    surroundings = "Nearby trees and structures are around the same height"
    tree_heights = [height * 0.9, height * 1.05, height * 0.85, height * 1.0]
    tree_positions = [-35, -20, 21, 36]
elif c_d == 2.00:
    surroundings = "The pole stands on elevated or exposed ground"
    tree_heights = [height * 0.35, height * 0.25, height * 0.4]
    tree_positions = [-36, 27, 40]
else:
    surroundings = "The pole stands alone on open ground"
    tree_heights = []
    tree_positions = []

# Ground and optional hill
ground_y = [0, 0, 0, 0]
ground_x = [-scene_limit, -scene_limit / 2, scene_limit / 2, scene_limit]
if c_d == 2.00:
    ground_y = [0, 3, 5, 7]
scene.add_trace(go.Scatter(
    x=ground_x,
    y=ground_y,
    mode="lines",
    name="Ground",
    line={"color": "#56735b", "width": 8},
    hoverinfo="skip",
))

for index, (tree_x, tree_height) in enumerate(zip(tree_positions, tree_heights)):
    ground_height = float(np.interp(tree_x, ground_x, ground_y))
    scene.add_trace(go.Scatter(
        x=[tree_x, tree_x],
        y=[ground_height, ground_height + tree_height * 0.42],
        mode="lines",
        name="Nearby tree" if index == 0 else None,
        showlegend=index == 0,
        line={"color": "#6b4226", "width": 7},
        hovertemplate=f"Nearby tree<br>Height: {tree_height:.1f} m<extra></extra>",
    ))
    scene.add_trace(go.Scatter(
        x=[tree_x],
        y=[ground_height + tree_height * 0.72],
        mode="markers",
        name=None,
        showlegend=False,
        marker={"symbol": "triangle-up", "size": 42, "color": "#2e8b57"},
        hoverinfo="skip",
    ))
    scene.add_trace(go.Scatter(
        x=[tree_x],
        y=[ground_height + tree_height],
        mode="markers",
        name=None,
        showlegend=False,
        marker={"symbol": "triangle-up", "size": 34, "color": "#3fa66b"},
        hoverinfo="skip",
    ))

# Pole
pole_ground = float(np.interp(0, ground_x, ground_y))
scene.add_trace(go.Scatter(
    x=[0, 0],
    y=[pole_ground, pole_ground + height],
    mode="lines",
    name=f"Pole ({height:g} m)",
    line={"color": "#25354a", "width": 10},
    hovertemplate=f"Pole<br>Height: {height:g} m<extra></extra>",
))
scene.add_trace(go.Scatter(
    x=[0],
    y=[pole_ground + height],
    mode="markers",
    name="Pole top",
    marker={"color": "#ef476f", "size": 14, "line": {"color": "white", "width": 2}},
    hovertemplate="Pole top: likely strike point<extra></extra>",
))

# Cloud and stylized lightning path
cloud_y = max(height * 1.85, 32)
scene.add_trace(go.Scatter(
    x=[-15, -8, 0, 8, 15],
    y=[cloud_y, cloud_y + 3, cloud_y + 1, cloud_y + 3, cloud_y],
    mode="lines+markers",
    name="Storm cloud",
    line={"color": "#718096", "width": 5},
    marker={"size": 22, "color": "#9aa9bd"},
    hoverinfo="skip",
))
bolt_x = [0, -3, 2, -2, 1, 0]
bolt_y = [cloud_y - 3, cloud_y - 9, cloud_y - 9, cloud_y - 16, cloud_y - 16, pole_ground + height + 1]
scene.add_trace(go.Scatter(
    x=bolt_x,
    y=bolt_y,
    mode="lines",
    name="Lightning path",
    line={"color": "#f4b400", "width": 5},
    hovertemplate="Illustrative lightning path<extra></extra>",
))

scene.add_annotation(
    x=0,
    y=-scene_limit * 0.08,
    text=surroundings,
    showarrow=False,
    font={"size": 14, "color": "#30445d"},
)
scene.update_layout(
    height=430,
    margin={"l": 10, "r": 10, "t": 15, "b": 35},
    paper_bgcolor="#f7fbff",
    plot_bgcolor="#eaf4ff",
    showlegend=True,
    legend={"orientation": "h", "y": 1.02, "x": 0},
    xaxis={"visible": False, "range": [-scene_limit, scene_limit]},
    yaxis={"visible": False, "range": [-scene_limit * 0.12, max(cloud_y + 8, height * 2.2)]},
)
st.plotly_chart(scene, use_container_width=True, config={"displayModeBar": False})

# Interactive visualization
st.markdown('<div class="section-title">Interactive protection geometry</div>', unsafe_allow_html=True)
st.caption("Drag to pan, scroll to zoom, or hover over the geometry for details.")

r_c = results["collection_radius"]
S = results["striking_distance"]
horizontal_limit = max(r_c * 1.5, S * 1.5, 60)
fig = go.Figure()

# 1. Ground level line
fig.add_trace(go.Scatter(
    x=[-horizontal_limit, horizontal_limit],
    y=[0, 0],
    mode="lines",
    name="Ground level",
    line={"color": "saddlebrown", "width": 3},
))

# 2. Pole Trunk
fig.add_trace(go.Scatter(
    x=[0, 0],
    y=[0, height],
    mode="lines",
    name=f"Pole ({height:g} m)",
    line={"color": "black", "width": 7},
))

# 3. Pole Top Marker
fig.add_trace(go.Scatter(
    x=[0],
    y=[height],
    mode="markers",
    name="Pole top",
    marker={"color": "red", "size": 12},
))

# 4. Collection Radius Indicator
fig.add_trace(go.Scatter(
    x=[-r_c, r_c],
    y=[0, 0],
    mode="lines",
    name=f"Collection radius ({r_c:.1f} m)",
    line={"color": "royalblue", "dash": "dash", "width": 2},
))

# 5. FIXED: Correctly Anchored Rolling Sphere Arc
if S >= height / 2:
    # Compute sphere center coordinates (x_c, y_c) tangent to ground (y=0) and touching (0, height)
    x_c = np.sqrt(max(0.0, S**2 - (S - height)**2))
    y_c = S
    
    # Angle at pole top connection (0, height): phi_top = pi - arcsin((S - height) / S)
    phi_top = np.pi - np.arcsin((S - height) / S)
    phi_ground = 1.5 * np.pi  # Bottom tangent to ground at y=0

    angles = np.linspace(phi_top, phi_ground, 200)
    circle_x = x_c + S * np.cos(angles)
    circle_y = y_c + S * np.sin(angles)

    fig.add_trace(go.Scatter(
        x=circle_x,
        y=circle_y,
        mode="lines",
        name=f"Rolling sphere ({S:.1f} m)",
        line={"color": "darkorange", "dash": "dot", "width": 2},
    ))

fig.update_layout(
    height=500,
    margin={"l": 20, "r": 20, "t": 40, "b": 20},
    title="Electrogeometric Model (EGM)",
    xaxis_title="Horizontal distance (m)",
    yaxis_title="Height (m)",
    hovermode="x unified",
    legend={"orientation": "h", "y": -0.2},
)
fig.update_xaxes(range=[-horizontal_limit, horizontal_limit], zeroline=False)
fig.update_yaxes(
    range=[-5, max(height * 2, S * 1.2)],
    scaleanchor="x",
    scaleratio=1,
)

st.plotly_chart(fig, use_container_width=True)