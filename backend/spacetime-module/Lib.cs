using SpacetimeDB;

// ─── Tables ────────────────────────────────────────────────────────────────

[SpacetimeDB.Table(Name = "user", Public = true)]
public partial struct DbUser
{
    [SpacetimeDB.PrimaryKey]
    public string Id;
    [SpacetimeDB.Unique]
    public string Email;
    public string Name;
    public string Password;
    public string Role;
    public long CreatedAt;
    public long UpdatedAt;
}

[SpacetimeDB.Table(Name = "deal", Public = true)]
public partial struct DbDeal
{
    [SpacetimeDB.PrimaryKey]
    public string Id;
    public string Title;
    public string Description;
    public double Amount;
    public double FeeAmount;
    public double NetAmount;
    public string Currency;
    public string Status;
    public long Deadline;
    public string BuyerId;
    public string SellerId;
    public string? StripePaymentIntentId;
    public string? StripeTransferId;
    public string? DeliveryNote;
    public long? DeliveredAt;
    public long? CompletedAt;
    public long? RefundedAt;
    // Campo para "Compra Gestionada" — URL del producto que el cliente quiere adquirir
    public string? ProductUrl;
    public long CreatedAt;
    public long UpdatedAt;
}

[SpacetimeDB.Table(Name = "dispute", Public = true)]
public partial struct DbDispute
{
    [SpacetimeDB.PrimaryKey]
    public string Id;
    [SpacetimeDB.Unique]
    public string DealId;
    public string RaisedById;
    public string Reason;
    public string? Evidence;
    public string Status;
    public string? Resolution;
    public long? ResolvedAt;
    public long CreatedAt;
}

[SpacetimeDB.Table(Name = "notification", Public = true)]
public partial struct DbNotification
{
    [SpacetimeDB.PrimaryKey]
    public string Id;
    public string UserId;
    public string? DealId;
    public string Type;
    public string Title;
    public string Message;
    public bool Read;
    public long CreatedAt;
}

// Tabla de evidencias: documentos/fotos que deben subirse antes de completar el trato
[SpacetimeDB.Table(Name = "evidence", Public = true)]
public partial struct DbEvidence
{
    [SpacetimeDB.PrimaryKey]
    public string Id;
    public string DealId;
    public string UploadedById;
    public string Url;
    public string Description;
    public long CreatedAt;
}

// ─── Module ────────────────────────────────────────────────────────────────

public static partial class Module
{
    // ─── User Reducers ───────────────────────────────────────────────────

    [SpacetimeDB.Reducer]
    public static void CreateUser(ReducerContext ctx, string id, string email, string name, string password, string role)
    {
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbUser.Insert(new DbUser
        {
            Id = id,
            Email = email,
            Name = name,
            Password = password,
            Role = role,
            CreatedAt = now,
            UpdatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void UpdateUser(ReducerContext ctx, string id, string name, string email)
    {
        var user = ctx.Db.DbUser.Id.Find(id);
        if (user is null) throw new Exception($"User {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbUser.Id.Update(new DbUser
        {
            Id = id,
            Email = email,
            Name = name,
            Password = user.Value.Password,
            Role = user.Value.Role,
            CreatedAt = user.Value.CreatedAt,
            UpdatedAt = now,
        });
    }

    // Actualiza nombre, email y contraseña desde el panel de admin
    [SpacetimeDB.Reducer]
    public static void UpdateUserCredentials(ReducerContext ctx, string id, string name, string email, string hashedPassword)
    {
        var user = ctx.Db.DbUser.Id.Find(id);
        if (user is null) throw new Exception($"User {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbUser.Id.Update(new DbUser
        {
            Id = id,
            Email = email,
            Name = name,
            Password = hashedPassword,
            Role = user.Value.Role,
            CreatedAt = user.Value.CreatedAt,
            UpdatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void SetUserRole(ReducerContext ctx, string id, string role)
    {
        var user = ctx.Db.DbUser.Id.Find(id);
        if (user is null) throw new Exception($"User {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbUser.Id.Update(new DbUser
        {
            Id = id,
            Email = user.Value.Email,
            Name = user.Value.Name,
            Password = user.Value.Password,
            Role = role,
            CreatedAt = user.Value.CreatedAt,
            UpdatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void UpdateUserPassword(ReducerContext ctx, string id, string newPassword)
    {
        var user = ctx.Db.DbUser.Id.Find(id);
        if (user is null) throw new Exception($"User {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbUser.Id.Update(new DbUser
        {
            Id = id,
            Email = user.Value.Email,
            Name = user.Value.Name,
            Password = newPassword,
            Role = user.Value.Role,
            CreatedAt = user.Value.CreatedAt,
            UpdatedAt = now,
        });
    }

    // Elimina un usuario — solo debe llamarse desde el backend después de validar que no tiene deals activos
    [SpacetimeDB.Reducer]
    public static void DeleteUser(ReducerContext ctx, string id)
    {
        var user = ctx.Db.DbUser.Id.Find(id);
        if (user is null) throw new Exception($"User {id} not found");
        ctx.Db.DbUser.Id.Delete(id);
    }

    // ─── Deal Reducers ───────────────────────────────────────────────────

    [SpacetimeDB.Reducer]
    public static void CreateDeal(
        ReducerContext ctx,
        string id,
        string title,
        string description,
        double amount,
        double feeAmount,
        double netAmount,
        string currency,
        string status,
        long deadline,
        string buyerId,
        string sellerId,
        // URL del producto para modo "Compra Gestionada" (nullable)
        string? productUrl)
    {
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbDeal.Insert(new DbDeal
        {
            Id = id,
            Title = title,
            Description = description,
            Amount = amount,
            FeeAmount = feeAmount,
            NetAmount = netAmount,
            Currency = currency,
            Status = status,
            Deadline = deadline,
            BuyerId = buyerId,
            SellerId = sellerId,
            StripePaymentIntentId = null,
            StripeTransferId = null,
            DeliveryNote = null,
            DeliveredAt = null,
            CompletedAt = null,
            RefundedAt = null,
            ProductUrl = productUrl,
            CreatedAt = now,
            UpdatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void UpdateDealStatus(ReducerContext ctx, string id, string status)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.Status = status;
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void UpdateDealStripeIntent(ReducerContext ctx, string id, string paymentIntentId)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.StripePaymentIntentId = paymentIntentId;
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void MarkDealDelivered(ReducerContext ctx, string id, string deliveryNote)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.Status = "DELIVERED";
        updated.DeliveryNote = deliveryNote;
        updated.DeliveredAt = now;
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void MarkDealCompleted(ReducerContext ctx, string id)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.Status = "COMPLETED";
        updated.CompletedAt = now;
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void MarkDealRefunded(ReducerContext ctx, string id)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.Status = "REFUNDED";
        updated.RefundedAt = now;
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void CancelDeal(ReducerContext ctx, string id)
    {
        var deal = ctx.Db.DbDeal.Id.Find(id);
        if (deal is null) throw new Exception($"Deal {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = deal.Value;
        updated.Status = "CANCELLED";
        updated.UpdatedAt = now;
        ctx.Db.DbDeal.Id.Update(updated);
    }

    // ─── Dispute Reducers ────────────────────────────────────────────────

    [SpacetimeDB.Reducer]
    public static void CreateDispute(
        ReducerContext ctx,
        string id,
        string dealId,
        string raisedById,
        string reason,
        string? evidence)
    {
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbDispute.Insert(new DbDispute
        {
            Id = id,
            DealId = dealId,
            RaisedById = raisedById,
            Reason = reason,
            Evidence = evidence,
            Status = "OPEN",
            Resolution = null,
            ResolvedAt = null,
            CreatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void UpdateDisputeStatus(ReducerContext ctx, string id, string status)
    {
        var dispute = ctx.Db.DbDispute.Id.Find(id);
        if (dispute is null) throw new Exception($"Dispute {id} not found");
        var updated = dispute.Value;
        updated.Status = status;
        ctx.Db.DbDispute.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void ResolveDispute(ReducerContext ctx, string id, string status, string resolution)
    {
        var dispute = ctx.Db.DbDispute.Id.Find(id);
        if (dispute is null) throw new Exception($"Dispute {id} not found");
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var updated = dispute.Value;
        updated.Status = status;
        updated.Resolution = resolution;
        updated.ResolvedAt = now;
        ctx.Db.DbDispute.Id.Update(updated);
    }

    // ─── Notification Reducers ───────────────────────────────────────────

    [SpacetimeDB.Reducer]
    public static void CreateNotification(
        ReducerContext ctx,
        string id,
        string userId,
        string? dealId,
        string type,
        string title,
        string message)
    {
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbNotification.Insert(new DbNotification
        {
            Id = id,
            UserId = userId,
            DealId = dealId,
            Type = type,
            Title = title,
            Message = message,
            Read = false,
            CreatedAt = now,
        });
    }

    [SpacetimeDB.Reducer]
    public static void MarkNotificationRead(ReducerContext ctx, string id)
    {
        var notif = ctx.Db.DbNotification.Id.Find(id);
        if (notif is null) return;
        var updated = notif.Value;
        updated.Read = true;
        ctx.Db.DbNotification.Id.Update(updated);
    }

    [SpacetimeDB.Reducer]
    public static void MarkAllNotificationsRead(ReducerContext ctx, string userId)
    {
        foreach (var notif in ctx.Db.DbNotification.Iter())
        {
            if (notif.UserId == userId && !notif.Read)
            {
                var updated = notif;
                updated.Read = true;
                ctx.Db.DbNotification.Id.Update(updated);
            }
        }
    }

    // ─── Evidence Reducers ───────────────────────────────────────────────

    // Guarda una evidencia (foto/URL) obligatoria antes de completar el trato
    [SpacetimeDB.Reducer]
    public static void CreateEvidence(
        ReducerContext ctx,
        string id,
        string dealId,
        string uploadedById,
        string url,
        string description)
    {
        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        ctx.Db.DbEvidence.Insert(new DbEvidence
        {
            Id = id,
            DealId = dealId,
            UploadedById = uploadedById,
            Url = url,
            Description = description,
            CreatedAt = now,
        });
    }
}
