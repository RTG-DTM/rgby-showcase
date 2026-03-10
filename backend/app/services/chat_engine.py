import random

from app.models.schemas import RGBYVector

# Mock AI response templates keyed by dominant user RGBY channel.
# Each response is crafted to contain lexicon keywords that produce
# meaningful RGBY scores when analyzed by the real rgby.py engine.

_RESPONSES = {
    "R": [
        "This presents significant risk exposure. The compliance framework must impose strict boundaries around data handling. Failure to adhere to these restrictions could result in criminal liability. Urgent remediation is required before the breach escalates.",
        "The danger here is material. Under section 14 of the regulatory framework, organisations must not process restricted data without explicit authorisation. The penalty structure makes this a high-priority risk item requiring immediate procedural lockdown.",
        "Critical liability detected. The system architecture must enforce prohibitive controls at every gateway. Any failure in the restriction layer exposes the organisation to breach notifications and regulatory sanctions.",
    ],
    "G": [
        "The system architecture follows a structured pattern with clear workflow stages. The framework model integrates verification steps at each checkpoint. This procedural approach ensures the process flow maintains structural integrity throughout the pipeline.",
        "Following the established pattern, the system processes data through a multi-stage workflow. Each step in the process validates against the framework model before proceeding. The architecture ensures systematic verification at every checkpoint.",
        "The structural model implements a layered pattern with clear process boundaries. Each workflow stage follows the framework architecture, ensuring systematic validation. The system design maintains procedural rigour across all integration points.",
    ],
    "B": [
        "Under section 12 of the Act, the procedure requires organisations to maintain compliance with established policy frameworks. The regulation mandates specific clause-level adherence. Each process shall follow the prescribed procedural steps as defined in the statutory instrument.",
        "The regulatory framework establishes clear policy procedures under clause 7. Organisations shall comply with the process requirements set out in the relevant sections. The Act defines specific procedural obligations that must be documented and audited.",
        "According to the applicable regulation, section 9 prescribes the compliance procedures. The policy framework shall be implemented in accordance with the statutory clauses. Each process step must reference the governing regulatory provisions.",
    ],
    "Y": [
        "There may be several approaches worth considering here. The situation presents some ambiguity, and discretionary judgement could guide the selection. Possibly a flexible strategy might accommodate the uncertain elements, though the options remain open.",
        "This could be interpreted in multiple ways. The discretionary elements suggest flexibility in approach. It might be worth exploring alternative options, as the ambiguous nature of the requirement allows for creative problem-solving.",
        "The unclear parameters here may benefit from a discretionary approach. Several options could work, and there might be room for flexible interpretation. Consider exploring the possibilities before committing to a rigid framework.",
    ],
    "balanced": [
        "The governance framework requires careful risk assessment alongside structured procedural compliance. Under the relevant regulatory sections, organisations must balance restrictive controls with operational flexibility. The system architecture shall enforce policy boundaries while allowing discretionary adaptation where appropriate.",
        "Applying the regulatory framework, this situation demands both procedural rigour and adaptive judgement. The risk parameters must be evaluated against the compliance policy, while the system architecture maintains structured workflow patterns. There may be scope for discretionary interpretation within the established boundaries.",
    ],
}


def generate_response(text: str, user_vector: RGBYVector) -> str:
    scores = {"R": user_vector.R, "G": user_vector.G, "B": user_vector.B, "Y": user_vector.Y}
    dominant = max(scores, key=scores.get)  # type: ignore[arg-type]

    max_val = scores[dominant]
    second = sorted(scores.values(), reverse=True)[1]
    if max_val - second <= 1:
        pool = _RESPONSES["balanced"]
    else:
        pool = _RESPONSES[dominant]

    return random.choice(pool)
