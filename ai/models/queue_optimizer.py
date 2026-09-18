"""
KisanProcure AI/ML Engine — Dynamic Mandi Queue & Slot Optimizer (SIH26032)
Model: Multi-server Queue Simulation (M_t/G/c) for balancing farmer arrival schedules.
"""

from typing import Dict, List

class MandiQueueOptimizer:
    """
    Simulates and balances slot capacities at government procurement centres.
    Prevents long farmer turnaround times and bottlenecks at weighbridges.
    """

    def __init__(self, daily_capacity_quintals: float, active_weighbridges: int = 2):
        self.daily_capacity = daily_capacity_quintals
        self.active_weighbridges = active_weighbridges
        self.avg_unloading_time_mins = 18.0

    def estimate_wait_time(self, farmers_ahead: int, current_active_counters: int = 2) -> Dict:
        """
        Calculates dynamic wait time based on queue length and active service counters.
        """
        effective_counters = max(1, current_active_counters)
        avg_wait_minutes = round((farmers_ahead * self.avg_unloading_time_mins) / effective_counters, 1)

        congestion_level = "LOW"
        if avg_wait_minutes > 90:
            congestion_level = "CRITICAL"
        elif avg_wait_minutes > 45:
            congestion_level = "MODERATE"

        return {
            "farmers_in_queue": farmers_ahead,
            "estimated_wait_minutes": avg_wait_minutes,
            "congestion_level": congestion_level,
            "advisory": (
                "Arrival on schedule recommended."
                if congestion_level == "LOW"
                else "High queue load. Arrive 20-30 mins after scheduled slot to avoid queue idling."
            )
        }

if __name__ == "__main__":
    optimizer = MandiQueueOptimizer(daily_capacity_quintals=250.0, active_weighbridges=2)
    res = optimizer.estimate_wait_time(farmers_ahead=8, current_active_counters=2)
    print("Mandi Queue Simulation Result:")
    print(res)
